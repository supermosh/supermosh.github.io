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
configurable width/height
clips drag and drop
clips delete
download link
better UI
*/

const width = 1920;
const height = 1080;

type Media = {
  name: string;
  file: File;
  poster: string;
  pkts: EncodedPacket[];
  isConverting: boolean;
  conversionProgress: number;
};

type Clip = {
  id: number;
  name: string;
  effect:
    | { kind: "copy"; from: number; to: number }
    | { kind: "glide"; at: number; duration: number }
    | { kind: "stretch"; from: number; to: number; rate: number };
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
  const [medias, setMedias] = useState<Media[]>([]);
  const [decoderConfig, setDecoderConfig] = useState<VideoDecoderConfig | null>(
    null,
  );
  const [timeline, setTimeline] = useState<Clip[]>([]);
  const [videoSrc, setVideoSrc] = useState("");

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
    };
    medias.push(media);
    setMedias([...medias]);

    // convert
    const convInput = new Input({
      formats: ALL_FORMATS,
      source: new BlobSource(file),
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
      setMedias(medias.map((m) => (m.name === name ? { ...media } : m)));
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
    setMedias(medias.map((m) => (m.name === name ? { ...media } : m)));
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
        switch (clip.effect.kind) {
          case "copy":
            indices = retimers.copy(clip.effect.from, clip.effect.to);
            break;
          case "glide":
            indices = retimers.glide(clip.effect.at, clip.effect.duration);
            break;
          case "stretch":
            indices = retimers.stretch(
              clip.effect.from,
              clip.effect.to,
              clip.effect.rate,
            );
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

  return (
    <>
      <h1>Files</h1>
      <ul>
        {medias.map((media) => (
          <li key={media.name}>
            <img src={media.poster} style={{ width: "100px" }}></img>
            <span>{media.name}</span>
            {media.isConverting ? (
              <>
                <progress value={media.conversionProgress} />
              </>
            ) : (
              <>{media.pkts.length}</>
            )}
          </li>
        ))}
        <li>
          <input
            type="file"
            accept="video/*"
            onChange={onUpload}
            disabled={medias.some((media) => media.isConverting)}
          />
        </li>
      </ul>

      <h1>Timeline</h1>
      <ol>
        {timeline.map((clip) => (
          <li key={clip.id}>
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
            <select
              value={clip.effect.kind}
              onChange={(evt) => {
                switch (evt.target.value) {
                  case "copy":
                    clip.effect = { kind: "copy", from: 0, to: 1 };
                    break;
                  case "glide":
                    clip.effect = { kind: "glide", at: 0, duration: 1 };
                    break;
                  case "stretch":
                    clip.effect = { kind: "stretch", from: 0, to: 1, rate: 1 };
                    break;
                }
                setTimeline([...timeline]);
              }}
            >
              <option value={"copy"}>copy</option>
              <option value={"glide"}>glide</option>
              <option value={"stretch"}>stretch</option>
            </select>

            {clip.effect.kind === "copy" && (
              <>
                <input
                  type="number"
                  value={clip.effect.from}
                  onChange={(evt) => {
                    // @ts-expect-error
                    clip.effect.from = evt.target.valueAsNumber;
                    setTimeline([...timeline]);
                  }}
                  title="from"
                />
                <input
                  type="number"
                  value={clip.effect.to}
                  onChange={(evt) => {
                    // @ts-expect-error
                    clip.effect.to = evt.target.valueAsNumber;
                    setTimeline([...timeline]);
                  }}
                  title="to"
                />
              </>
            )}
            {clip.effect.kind === "glide" && (
              <>
                <input
                  type="number"
                  value={clip.effect.at}
                  onChange={(evt) => {
                    // @ts-expect-error
                    clip.effect.at = evt.target.valueAsNumber;
                    setTimeline([...timeline]);
                  }}
                  title="at"
                />
                <input
                  type="number"
                  value={clip.effect.duration}
                  onChange={(evt) => {
                    // @ts-expect-error
                    clip.effect.duration = evt.target.valueAsNumber;
                    setTimeline([...timeline]);
                  }}
                  title="duration"
                />
              </>
            )}
            {clip.effect.kind === "stretch" && (
              <>
                <input
                  type="number"
                  value={clip.effect.from}
                  onChange={(evt) => {
                    // @ts-expect-error
                    clip.effect.from = evt.target.valueAsNumber;
                    setTimeline([...timeline]);
                  }}
                  title="from"
                />
                <input
                  type="number"
                  value={clip.effect.to}
                  onChange={(evt) => {
                    // @ts-expect-error
                    clip.effect.to = evt.target.valueAsNumber;
                    setTimeline([...timeline]);
                  }}
                  title="to"
                />
                <input
                  type="number"
                  value={clip.effect.rate}
                  onChange={(evt) => {
                    // @ts-expect-error
                    clip.effect.rate = evt.target.valueAsNumber;
                    setTimeline([...timeline]);
                  }}
                  title="rate"
                />
              </>
            )}
          </li>
        ))}
        <li>
          {medias[0] && (
            <button
              onClick={() => {
                setTimeline([
                  ...timeline,
                  {
                    id: Math.random(),
                    name: medias[0].name,
                    effect: {
                      kind: "copy",
                      from: 0,
                      to: medias[0].pkts.length,
                    },
                  },
                ]);
              }}
            >
              add
            </button>
          )}
        </li>
      </ol>

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
