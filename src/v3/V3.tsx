import "./V3.css";

import { checkFile } from "birdview";
import {
  ALL_FORMATS,
  BlobSource,
  BufferSource,
  BufferTarget,
  Conversion,
  ConversionCanceledError,
  EncodedPacket,
  EncodedPacketSink,
  EncodedVideoPacketSource,
  Input,
  Mp4OutputFormat,
  Output,
  VideoSampleSink,
} from "mediabunny";
import { useRef, useState, VideoHTMLAttributes } from "react";

import { x } from "../scratch/lib";

/*
TODO
Render at specific rate
Test and fix UI on all platforms
Timeline preview
Sounds
*/

type Media = {
  name: string;
  file: File;
  url: string;
  poster: string;
  pkts: EncodedPacket[];
  isConverting: boolean;
  conversionProgress: number;
  conversionError: string;
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
  warning: string;
  previewFrame: number;
  repeat: number;
};

const moshers = {
  copy: (from: number, to: number) =>
    Array(to - from)
      .fill(null)
      .map((_, i) => from + i),
  glide: (at: number, duration: number) =>
    Array(duration)
      .fill(null)
      .map(() => at),
  stretch: (from: number, to: number, rate: number) => {
    const length = Math.floor((to - from) / rate);
    return Array(length)
      .fill(null)
      .map((_, i) => Math.floor(from + i * rate));
  },
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

  let sample = await sink.getSample(0);
  // some videos don't start with a 0 timestamp
  if (!sample) {
    const samples = sink.samples();
    for await (const s of samples) {
      sample = s;
      continue;
    }
  }
  sample = x(sample);

  const canvas = new OffscreenCanvas(sample.codedWidth, sample.codedHeight);
  const ctx = x(canvas.getContext("2d"));
  sample.draw(ctx, 0, 0);
  sample.close();
  const blob = await canvas.convertToBlob();
  return URL.createObjectURL(blob);
};

const TimedVideo = ({
  time,
  ...props
}: VideoHTMLAttributes<HTMLVideoElement> & { time: number }) => {
  const [elt, setElt] = useState(null as HTMLVideoElement | null);
  if (elt && !isNaN(time)) elt.currentTime = time;
  return <video {...props} ref={setElt} />;
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
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const pendingConversionCancels = useRef<Set<string>>(new Set());
  const [renderError, setRenderError] = useState("");

  const keyframesAt = (pkts: EncodedPacket[]) =>
    pkts
      .map((pkt, i) => ({ pkt, i }))
      .filter(({ pkt }) => pkt.type === "key")
      .map(({ i }) => i);

  const convert = async (media: Media) => {
    media.isConverting = true;
    media.conversionProgress = 0;
    media.conversionError = "";
    setMedias(medias.map((m) => (m.name === media.name ? { ...media } : m)));

    const cancel = () => {
      media.isConverting = false;
      media.conversionProgress = 0;
      media.conversionError = "";
      setMedias(medias.map((m) => (m.name === media.name ? { ...media } : m)));
      pendingConversionCancels.current.delete(media.name);
    };

    try {
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
      if (!conversion.isValid)
        throw new Error("Failed to convert to baseline h264 (avc1.42c02a).");
      conversion.onProgress = async (progress: number) => {
        media.conversionProgress = progress;
        setMedias(
          medias.map((m) => (m.name === media.name ? { ...media } : m)),
        );

        if (pendingConversionCancels.current.has(media.name)) {
          await conversion.cancel();
        }
      };
      try {
        await conversion.execute();
      } catch (e) {
        if (e instanceof ConversionCanceledError) {
          cancel();
          return;
        } else {
          throw e;
        }
      }

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
        if (pendingConversionCancels.current.has(media.name)) {
          cancel();
          return;
        }
      }

      media.conversionProgress = 1;
      media.isConverting = false;
      media.pkts = pkts;
      media.width = width;
      media.height = height;
      setMedias(medias.map((m) => (m.name === media.name ? { ...media } : m)));
    } catch (e) {
      console.log(e);
      media.isConverting = false;
      media.conversionError = `${e} | Conversion failed, try using another video or another browser`;
      media.conversionProgress = 0;
      setMedias(medias.map((m) => (m.name === media.name ? { ...media } : m)));
    }
  };

  const onUpload = async (
    evt: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    const [file] = evt.target.files ?? [];
    if (!file) {
      console.warn("Should upload at least one file");
      return;
    }

    checkFile(file);

    let name = file.name;
    let newNameSuffix = 1;
    while (medias.some((upload) => upload.name === name)) {
      name = `${file.name}_${newNameSuffix}`;
      newNameSuffix++;
    }

    const media: Media = {
      name,
      file,
      url: URL.createObjectURL(file),
      // 1x1 pink png
      poster:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4z/D/PwAG/gL+kr3ExQAAABBkZUJHRDI1N0RGRDMwMTRDOTQyNjg5W1gAAAAASUVORK5CYII=",
      pkts: [],
      isConverting: true,
      conversionProgress: 0,
      conversionError: "",
      width,
      height,
    };
    medias.push(media);
    setMedias([...medias]);

    try {
      media.poster = await getPoster(file);
    } catch (e) {
      media.conversionError = `${e}`;
    }
    setMedias(medias.map((m) => ({ ...m })));
    await convert(media);

    evt.target.value = "";
  };

  const render = async () => {
    if (!decoderConfig) return;
    setIsRendering(true);
    setRenderProgress(0);
    setVideoSrc("");
    setRenderError("");

    try {
      const pktsByName = {} as Record<string, EncodedPacket[]>;
      for (const media of medias) {
        pktsByName[media.name] = media.pkts;
      }
      const repkts = timeline
        .flatMap((clip) =>
          Array(clip.repeat)
            .fill(null)
            .map(() => clip),
        )
        .map((clip, i) => {
          let indices = [] as number[];
          switch (clip.effect) {
            case "copy":
              indices = moshers.copy(clip.from, clip.to);
              break;
            case "glide":
              indices = moshers.glide(clip.from, clip.duration);
              break;
            case "stretch":
              indices = moshers.stretch(clip.from, clip.to, clip.rate);
              break;
          }

          // First clip should start on a keyframe. If not the case, add the closest one.
          if (i == 0) {
            const kfis = keyframesAt(pktsByName[clip.name]);
            if (!kfis.includes(indices[0])) {
              const kfi = kfis.filter((i) => i < indices[0]).slice(-1)[0] ?? 0;
              indices.unshift(kfi);
            }
          }
          return { name: clip.name, indices };
        })
        .flatMap(({ name, indices }) => indices.map((i) => pktsByName[name][i]))
        .filter((pkt, i) => i == 0 || pkt.type == "delta")
        .map((pkt, i) => {
          return new EncodedPacket(
            pkt.data,
            pkt.type,
            i * pkt.duration, // TODO add rate here
            pkt.duration, // TODO add rate here
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
        setRenderProgress(i / repkts.length);
        if (i % 100 == 0) {
          await new Promise((r) => requestAnimationFrame(r));
        }
        console.log("yo");
        i++;
      }
      await output.finalize();

      setIsRendering(false);
      setVideoSrc(
        URL.createObjectURL(
          new Blob([output.target.buffer!], { type: "video/mp4" }),
        ),
      );
    } catch (e) {
      console.error(e);
      setRenderError(`${e}`);
      setIsRendering(false);
      setRenderProgress(0);
      setVideoSrc("");
    }
  };

  const resize = async () => {
    for (const media of medias) {
      if (media.width === width && media.height === height) continue;
      await convert(media);
    }
  };

  const updateTimeline = () => {
    // fuck it. update everythang in place, but rebuild timeline on change time. also check for bounds and stuff.
    timeline.forEach((clip, i) => {
      const media = x(medias.find((m) => m.name === clip.name));
      clip.from = Math.max(clip.from, 0);
      if (clip.effect === "copy" || clip.effect === "stretch") {
        clip.from = Math.min(clip.from, media.pkts.length - 1);
        clip.to = Math.min(clip.to, media.pkts.length);
        clip.to = Math.max(clip.to, clip.from + 1);
      }

      clip.warning = "";
      if (i == 0 && media.pkts[clip.from]?.type !== "key") {
        clip.warning =
          "Clip does not start on a keyframe. The closest one will be added for you.";
      }
    });
    setTimeline(timeline.map((clip) => ({ ...clip })));
  };

  const isMediaValid = (media: Media) =>
    !media.conversionError &&
    media.pkts.length &&
    media.width === width &&
    media.height === height;

  return (
    <div className="v3">
      <section>
        <h1 className="section-heading">Files</h1>
        <div className="section-body">
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
            <button
              onClick={resize}
              disabled={
                !medias.some(
                  (media) => media.width !== width || media.height !== height,
                )
              }
            >
              Resize
            </button>
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

          {medias.length == 0 && (
            <div className="text-info">No videos added yet</div>
          )}
        </div>

        <div>
          {medias.map((media) => (
            <div
              key={media.name}
              className="card"
              style={{
                borderColor: media.isConverting
                  ? "var(--info)"
                  : media.conversionError
                    ? "var(--error)"
                    : media.width !== width ||
                        media.height !== height ||
                        media.pkts.length === 0
                      ? "var(--warning)"
                      : "white",
                margin: "8px",
              }}
            >
              <img
                src={media.poster}
                className="poster"
                style={{
                  aspectRatio: media.width / media.height,
                }}
              />
              <div>
                <div>{media.name}</div>
                {media.isConverting ? (
                  <>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <progress value={media.conversionProgress} />
                      <span>
                        Extracting frames... (
                        {(media.conversionProgress * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          pendingConversionCancels.current.add(media.name);
                        }}
                      >
                        Cancel extraction
                      </button>
                    </div>
                  </>
                ) : media.conversionError ? (
                  <div className="text-error">{media.conversionError}</div>
                ) : media.pkts.length === 0 ? (
                  <>
                    <div className="text-warning">
                      Packets not extracted yet
                    </div>
                    <div>
                      <button
                        onClick={async () => {
                          await convert(media);
                        }}
                      >
                        Extract packets
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>{`${media.pkts.length} frames (${(media.pkts.length * (media.pkts[0]?.duration ?? 0)).toFixed(2)}s)`}</div>
                    <div>{`Keyframes at ${keyframesAt(media.pkts).join(", ")}`}</div>
                    <div className="inline-space">
                      <span>{`Dimensions ${media.width}x${media.height}`}</span>
                      {media.width === width && media.height == height ? (
                        <span className="text-success">ok</span>
                      ) : (
                        <span className="text-warning">needs resize</span>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div>
                <button
                  onClick={() => {
                    setTimeline(
                      timeline.filter((clip) => clip.name !== media.name),
                    );
                    setMedias(medias.filter((m) => m.name !== media.name));
                  }}
                  disabled={media.isConverting}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h1 className="section-heading">Timeline</h1>
        <div className="section-body">
          {medias.length === 0 && (
            <div className="text-info">
              Please add videos to create a timeline
            </div>
          )}
          {timeline.length === 0 && (
            <div className="text-info">No clips added yet to the timeline</div>
          )}
          {timeline.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {timeline.map((clip, clipIndex) => {
                const media = medias.find((media) => media.name === clip.name)!;

                return (
                  <div
                    key={clip.id}
                    className="card"
                    style={{
                      borderColor: clip.warning ? "var(--warning)" : "white",
                    }}
                  >
                    <div className="clip-video">
                      <TimedVideo
                        src={media.url}
                        time={clip.previewFrame * media.pkts[0].duration}
                        style={{
                          aspectRatio: width / height,
                          objectFit: "cover",
                        }}
                      />
                      <input
                        type="range"
                        value={clip.from}
                        onChange={(evt) => {
                          clip.from = evt.target.valueAsNumber;
                          clip.previewFrame = clip.from;
                          updateTimeline();
                        }}
                        min={0}
                        max={media.pkts.length - 1}
                      />
                      {(clip.effect === "copy" ||
                        clip.effect === "stretch") && (
                        <input
                          type="range"
                          value={clip.to}
                          onChange={(evt) => {
                            clip.to = evt.target.valueAsNumber;
                            clip.previewFrame = clip.to;
                            updateTimeline();
                          }}
                          min={0}
                          max={media.pkts.length - 1}
                        />
                      )}
                    </div>
                    <div>
                      <div className="inline-space">
                        <span>File:</span>
                        <select
                          value={clip.name}
                          onChange={(evt) => {
                            clip.name = evt.target.value;
                            updateTimeline();
                          }}
                        >
                          {medias.filter(isMediaValid).map((media) => (
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
                            updateTimeline();
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
                                clip.previewFrame = clip.from;
                                updateTimeline();
                              }}
                            />
                            <span>to frame</span>
                            <input
                              type="number"
                              value={clip.to}
                              onChange={(evt) => {
                                clip.to = evt.target.valueAsNumber;
                                clip.previewFrame = clip.to;
                                updateTimeline();
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
                                clip.previewFrame = clip.from;
                                updateTimeline();
                              }}
                            />
                            <span>repeats</span>
                            <input
                              type="number"
                              value={clip.duration}
                              onChange={(evt) => {
                                clip.duration = evt.target.valueAsNumber;
                                updateTimeline();
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
                                clip.previewFrame = clip.from;
                                updateTimeline();
                              }}
                            />
                            <span>to frame</span>
                            <input
                              type="number"
                              value={clip.to}
                              onChange={(evt) => {
                                clip.to = evt.target.valueAsNumber;
                                clip.previewFrame = clip.to;
                                updateTimeline();
                              }}
                            />
                            <span>sped up by</span>
                            <input
                              type="number"
                              value={clip.rate}
                              onChange={(evt) => {
                                clip.rate = evt.target.valueAsNumber;
                                updateTimeline();
                              }}
                              step={0.1}
                              min={1 / 1000}
                            />
                          </>
                        )}
                      </div>
                      <div className="inline-space">
                        <span>Repeat clip</span>
                        <input
                          type="number"
                          value={clip.repeat}
                          onChange={(evt) => {
                            clip.repeat = evt.target.valueAsNumber;
                            updateTimeline();
                          }}
                          min={1}
                          step={1}
                        />
                        <span>times</span>
                      </div>
                      <div className="text-warning">{clip.warning}</div>
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
                          updateTimeline();
                        }}
                        disabled={clipIndex === 0}
                      >
                        Move up
                      </button>
                      <button
                        onClick={() => {
                          timeline.splice(clipIndex, 1);
                          updateTimeline();
                        }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          timeline.splice(
                            clipIndex,
                            2,
                            timeline[clipIndex + 1],
                            timeline[clipIndex],
                          );
                          updateTimeline();
                        }}
                        disabled={clipIndex === timeline.length - 1}
                      >
                        Move down
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div>
            {medias.length > 0 && medias.every(isMediaValid) && (
              <button
                onClick={() => {
                  setTimeline([
                    ...timeline,
                    {
                      id: Math.random(),
                      name: medias[0].name,
                      effect: "stretch",
                      from: 0,
                      to: medias[0].pkts.length,
                      rate: 0.5,
                      duration: 100,
                      warning: "",
                      previewFrame: 0,
                      repeat: 1,
                    },
                  ]);
                }}
              >
                Add clip
              </button>
            )}
          </div>
        </div>
      </section>

      <section>
        <h1 className="section-heading">Render</h1>

        <div className="section-body">
          <div className="inline-space">
            <button
              onClick={render}
              disabled={
                isRendering ||
                timeline.length === 0 ||
                medias.some((m) => m.width !== width || m.height !== height)
              }
            >
              Render
            </button>
            {timeline.length === 0 && (
              <span className="text-info">No clips in timeline</span>
            )}
            {medias.some((m) => m.width !== width || m.height !== height) && (
              <span className="text-warning">
                Not all media are of the desired render resolution
              </span>
            )}
            {isRendering && (
              <>
                <progress value={renderProgress} />
                <span>Rendering... ({(renderProgress * 100).toFixed(0)}%)</span>
              </>
            )}
          </div>

          {videoSrc && (
            <>
              <div className="inline-space">
                <a
                  href={videoSrc}
                  download={`Supermosh_${new Date().toLocaleDateString("sv")}_${new Date().toLocaleTimeString("sv").replaceAll(":", "-")}.mp4`}
                >
                  Download
                </a>
              </div>
              <video
                src={videoSrc}
                controls
                autoPlay
                muted
                loop
                style={{ maxWidth: "100%", maxHeight: "80vh" }}
              />
            </>
          )}

          {renderError && <div className="text-error">{renderError}</div>}
        </div>
      </section>
    </div>
  );
};
