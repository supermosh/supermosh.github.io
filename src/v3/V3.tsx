import {
  ALL_FORMATS,
  BlobSource,
  BufferSource,
  BufferTarget,
  Conversion,
  EncodedPacket,
  EncodedPacketSink,
  EncodedVideoPacketSource,
  Input,
  Mp4OutputFormat,
  Output,
  VideoSampleSink,
} from "mediabunny";
import { useState } from "react";

import { retimers, x } from "../scratch/lib";

/*
TODO
empty msgs
frame selector
iframe warnings
frame autoselect
better UI
*/

type Media = {
  name: string;
  file: File;
  poster: string;
  pkts: EncodedPacket[];
  isConverting: boolean;
  conversionProgress: number;
  width: number;
  height: number;
};

type Clip = {
  id: number;
  name: string;
  effect: "copy" | "glide" | "stretch";
  from: number;
  to: number;
  rate: number;
  duration: number;
};

const getPoster = async (file: File) => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new BlobSource(file),
  });
  const track = await input.getPrimaryVideoTrack();
  if (!track) throw new Error("No video track");
  const decodable = await track.canDecode();
  if (!decodable) throw new Error("Can't decode");
  const sink = new VideoSampleSink(track);
  const sample = x(await sink.getSample(0));

  const canvas = new OffscreenCanvas(sample.codedWidth, sample.codedHeight);
  const ctx = x(canvas.getContext("2d"));
  sample.draw(ctx, 0, 0);
  sample.close();
  const blob = await canvas.convertToBlob();
  return URL.createObjectURL(blob);
};

export const V3 = () => {
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);

  const [medias, setMedias] = useState<Media[]>([]);
  const [decoderConfig, setDecoderConfig] = useState<VideoDecoderConfig | null>(
    null,
  );
  const [timeline, setTimeline] = useState<Clip[]>([]);
  const [videoSrc, setVideoSrc] = useState("");

  const convert = async (media: Media) => {
    media.isConverting = true;
    media.conversionProgress = 0;
    setMedias(medias.map((m) => (m.name === media.name ? { ...media } : m)));

    const convInput = new Input({
      formats: ALL_FORMATS,
      source: new BlobSource(media.file),
    });
    const convOutput = new Output({
      format: new Mp4OutputFormat(),
      target: new BufferTarget(),
    });
    const conversion = await Conversion.init({
      input: convInput,
      output: convOutput,
      video: {
        width,
        height,
        fit: "cover",
        forceTranscode: true,
        codec: "avc",
        // Only works for a custom build of mediabunny, else is ignored and we hope for the best
        // avc1 = h264
        // 42 = baseline profile
        // c0 = constrained baseline
        // 2a = level 4.2 (max 522.240MBs, supports 60FPS HD)
        fullCodecString: "avc1.42c02a",
      },
    });
    if (!conversion.isValid) throw new Error("conv is not valid");
    conversion.onProgress = (progress: number) => {
      media.conversionProgress = progress;
      setMedias(medias.map((m) => (m.name === media.name ? { ...media } : m)));
    };
    await conversion.execute();

    const moshInput = new Input({
      formats: ALL_FORMATS,
      source: new BufferSource(x(convOutput.target.buffer)),
    });
    const track = x(await moshInput.getPrimaryVideoTrack());
    setDecoderConfig(x(await track.getDecoderConfig()));
    const sink = new EncodedPacketSink(track);
    const pkts: EncodedPacket[] = [];
    for await (const pkt of sink.packets()) {
      pkts.push(pkt);
    }

    media.conversionProgress = 1;
    media.isConverting = false;
    media.pkts = pkts;
    media.width = width;
    media.height = height;
    setMedias(medias.map((m) => (m.name === media.name ? { ...media } : m)));
  };

  const onUpload = async (
    evt: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    const [file] = evt.target.files ?? [];
    if (!file) {
      console.warn("Should upload at least one file");
      return;
    }

    let name = file.name;
    let newNameSuffix = 1;
    while (medias.some((upload) => upload.name === name)) {
      name = `${file.name}_${newNameSuffix}`;
      newNameSuffix++;
    }

    const poster = await getPoster(file);
    const media: Media = {
      name,
      file,
      poster,
      pkts: [],
      isConverting: true,
      conversionProgress: 0,
      width,
      height,
    };
    medias.push(media);
    setMedias([...medias]);

    await convert(media);

    evt.target.value = "";
  };

  const render = async () => {
    if (!decoderConfig) return;
    setVideoSrc("");

    const pktsByName = {} as Record<string, EncodedPacket[]>;
    for (const media of medias) {
      pktsByName[media.name] = media.pkts;
    }
    const repkts = timeline
      .map((clip) => {
        let indices = [] as number[];
        switch (clip.effect) {
          case "copy":
            indices = retimers.copy(clip.from, clip.to);
            break;
          case "glide":
            indices = retimers.glide(clip.from, clip.duration);
            break;
          case "stretch":
            indices = retimers.stretch(clip.from, clip.to, clip.rate);
            break;
        }
        return { name: clip.name, indices };
      })
      .flatMap(({ name, indices }) => indices.map((i) => pktsByName[name][i]))
      .filter((pkt, i) => i == 0 || pkt.type == "delta")
      .map((pkt, i) => {
        return new EncodedPacket(
          pkt.data,
          pkt.type,
          i * pkt.duration,
          pkt.duration,
        );
      });

    console.log("displaying...");
    console.log(decoderConfig.codec); // wrong codec?...
    const source = new EncodedVideoPacketSource("avc");
    const output = new Output({
      target: new BufferTarget(),
      format: new Mp4OutputFormat(),
    });
    output.addVideoTrack(source);
    output.start();
    let i = 0;
    while (i < repkts.length) {
      const pkt = repkts[i];
      await source.add(pkt, { decoderConfig });
      i++;
    }
    await output.finalize();
    setVideoSrc(URL.createObjectURL(new Blob([output.target.buffer!])));
  };

  const resize = async () => {
    for (const media of medias) {
      if (media.width === width && media.height === height) continue;
      await convert(media);
    }
  };

  return (
    <>
      <h1>Files</h1>

      <div className="inline-space">
        <span>Dimensions:</span>
        <input
          type="number"
          value={width}
          onChange={(evt) => setWidth(evt.target.valueAsNumber)}
        />
        x
        <input
          type="number"
          value={height}
          onChange={(evt) => setHeight(evt.target.valueAsNumber)}
        />
        <button
          disabled={width === 640 && height === 480}
          onClick={() => {
            setWidth(640);
            setHeight(480);
          }}
        >
          480p
        </button>
        <button
          disabled={width === 1920 && height === 1080}
          onClick={() => {
            setWidth(1920);
            setHeight(1080);
          }}
        >
          1080p
        </button>
        <button
          disabled={width === 3840 && height === 2160}
          onClick={() => {
            setWidth(3840);
            setHeight(2160);
          }}
        >
          4K
        </button>
        <button
          onClick={() => {
            setWidth(height);
            setHeight(width);
          }}
        >
          flip
        </button>
      </div>

      <div className="inline-space">
        <span>Re-process all videos to match resolution: </span>
        <button onClick={resize}>resize</button>
      </div>

      <div className="inline-space">
        <span>Add video:</span>
        <input
          type="file"
          accept="video/*"
          onChange={onUpload}
          disabled={medias.some((media) => media.isConverting)}
        />
      </div>

      <div>
        {medias.map((media) => (
          <div
            key={media.name}
            style={{
              display: "flex",
              gap: "8px",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor:
                media.isConverting ||
                media.width !== width ||
                media.height !== height
                  ? "var(--warning)"
                  : "white",
              padding: "8px",
              margin: "8px",
            }}
          >
            <img
              src={media.poster}
              style={{
                height: "4lh",
                aspectRatio: media.width / media.height,
                objectFit: "cover",
              }}
            />
            <div>
              <div>{media.name}</div>
              {media.isConverting ? (
                <div style={{ display: "flex", gap: "8px" }}>
                  <progress value={media.conversionProgress} />
                  <span>
                    Extracting frames... (
                    {(media.conversionProgress * 100).toFixed(0)}%)
                  </span>
                </div>
              ) : (
                <>
                  <div>{`${media.pkts.length} frames (${(media.pkts.length * (media.pkts[0]?.duration ?? 0)).toFixed(2)}s)`}</div>
                  <div>{`keyframes at ${media.pkts
                    .map((pkt, i) => ({ pkt, i }))
                    .filter(({ pkt }) => pkt.type === "key")
                    .map(({ i }) => i)}`}</div>
                  <div style={{ display: "flex", gap: "1ch" }}>
                    <span>{`Dimensions ${media.width}x${media.height}`}</span>
                    {media.width === width && media.height == height ? (
                      <span style={{ color: "var(--success)" }}>ok</span>
                    ) : (
                      <span style={{ color: "var(--warning)" }}>
                        needs resize
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <h1>Timeline</h1>
      <div>
        {timeline.map((clip, clipIndex) => {
          const media = medias.find((media) => media.name === clip.name)!;

          return (
            <div
              key={clip.id}
              style={{
                display: "flex",
                gap: "8px",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "white",
                padding: "8px",
                margin: "8px",
              }}
            >
              <img
                src={media.poster}
                style={{
                  aspectRatio: width / height,
                  height: "4lh",
                  objectFit: "cover",
                }}
              />
              <div>
                <div className="inline-space">
                  <span>File:</span>
                  <select
                    value={clip.name}
                    onChange={(evt) => {
                      clip.name = evt.target.value;
                      setTimeline([...timeline]);
                    }}
                  >
                    {medias.map((media) => (
                      <option key={media.name} value={media.name}>
                        {media.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="inline-space">
                  <span>Effect:</span>
                  <select
                    value={clip.effect}
                    onChange={(evt) => {
                      clip.effect = evt.target.value as Clip["effect"];
                      setTimeline([...timeline]);
                    }}
                  >
                    <option value={"copy"}>copy</option>
                    <option value={"glide"}>glide</option>
                    <option value={"stretch"}>stretch</option>
                  </select>
                </div>
                <div className="inline-space">
                  {clip.effect === "copy" && (
                    <>
                      <span>From frame</span>
                      <input
                        type="number"
                        value={clip.from}
                        onChange={(evt) => {
                          clip.from = evt.target.valueAsNumber;
                          setTimeline([...timeline]);
                        }}
                      />
                      <span>to frame</span>
                      <input
                        type="number"
                        value={clip.to}
                        onChange={(evt) => {
                          clip.to = evt.target.valueAsNumber;
                          setTimeline([...timeline]);
                        }}
                      />
                    </>
                  )}
                  {clip.effect === "glide" && (
                    <>
                      <span>Frame</span>
                      <input
                        type="number"
                        value={clip.from}
                        onChange={(evt) => {
                          clip.from = evt.target.valueAsNumber;
                          setTimeline([...timeline]);
                        }}
                      />
                      <span>repeats</span>
                      <input
                        type="number"
                        value={clip.duration}
                        onChange={(evt) => {
                          clip.duration = evt.target.valueAsNumber;
                          setTimeline([...timeline]);
                        }}
                      />
                      <span>times</span>
                    </>
                  )}
                  {clip.effect === "stretch" && (
                    <>
                      <span>From frame</span>
                      <input
                        type="number"
                        value={clip.from}
                        onChange={(evt) => {
                          clip.from = evt.target.valueAsNumber;
                          setTimeline([...timeline]);
                        }}
                      />
                      <span>to frame</span>
                      <input
                        type="number"
                        value={clip.to}
                        onChange={(evt) => {
                          clip.to = evt.target.valueAsNumber;
                          setTimeline([...timeline]);
                        }}
                      />
                      <span>sped up by</span>
                      <input
                        type="number"
                        value={clip.rate}
                        onChange={(evt) => {
                          clip.rate = evt.target.valueAsNumber;
                          setTimeline([...timeline]);
                        }}
                        step={0.1}
                        min={1 / 1000}
                      />
                    </>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <button
                  onClick={() => {
                    timeline.splice(
                      clipIndex - 1,
                      2,
                      timeline[clipIndex],
                      timeline[clipIndex - 1],
                    );
                    setTimeline([...timeline]);
                  }}
                  disabled={clipIndex === 0}
                >
                  move up
                </button>
                <button
                  onClick={() => {
                    timeline.splice(clipIndex, 1);
                    setTimeline([...timeline]);
                  }}
                >
                  delete
                </button>
                <button
                  onClick={() => {
                    timeline.splice(
                      clipIndex,
                      2,
                      timeline[clipIndex + 1],
                      timeline[clipIndex],
                    );
                    setTimeline([...timeline]);
                  }}
                  disabled={clipIndex === timeline.length - 1}
                >
                  move down
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div>
        {medias[0] && (
          <button
            onClick={() => {
              setTimeline([
                ...timeline,
                {
                  id: Math.random(),
                  name: medias[0].name,
                  effect: "copy",
                  from: 0,
                  to: medias[0].pkts.length,
                  rate: 1,
                  duration: 100,
                },
              ]);
            }}
          >
            add
          </button>
        )}
      </div>

      <h1>Render</h1>

      {!!timeline.length && <button onClick={render}>Render</button>}

      {videoSrc && (
        <video
          src={videoSrc}
          controls
          autoPlay
          muted
          loop
          style={{ maxWidth: "100%" }}
        ></video>
      )}
    </>
  );
};
