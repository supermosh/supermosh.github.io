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
} from "mediabunny";
import { useState } from "react";

import { x } from "../scratch/lib";

const width = 960;
const height = 540;

type Media = {
  name: string;
  pkts: EncodedPacket[];
};

type Clip = {
  id: number;
  name: string;
  effect:
    | { kind: "copy"; from: number; to: number }
    | { kind: "glide"; at: number; duration: number }
    | { kind: "stretch"; from: number; to: number; rate: number };
};

export const V3 = () => {
  const [videoSrc, setVideoSrc] = useState("");

  const scratch = async (
    evt: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    const [file] = evt.target.files ?? [];
    if (!file) throw new Error("Should be a file");

    // convert
    console.log("converting...");
    const width = 960;
    const height = 540;
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
        fullCodecString: "avc1.42c01f",
      },
    });
    if (!conversion.isValid) throw new Error("conv is not valid");
    // conversion.onProgress = (n) => console.log(`conv progress ${~~(100 * n)}%`);
    await conversion.execute();

    // mosh
    console.log("moshing...");
    const moshInput = new Input({
      formats: ALL_FORMATS,
      source: new BufferSource(x(convOutput.target.buffer)),
    });
    const track = x(await moshInput.getPrimaryVideoTrack());
    const decoderConfig = x(await track.getDecoderConfig());
    const sink = new EncodedPacketSink(track);
    const pkts: EncodedPacket[] = [];
    for await (const pkt of sink.packets()) {
      pkts.push(pkt);
    }
    console.log(pkts.length);
    const repkts = [
      ...pkts.slice(0, 25),
      ...Array(100)
        .fill(null)
        .map(() => pkts[25]),
    ]
      .filter((pkt, i) => i == 0 || pkt.type == "delta")
      .map((pkt, i) => {
        return new EncodedPacket(
          pkt.data,
          pkt.type,
          i * pkt.duration,
          pkt.duration,
        );
      });

    // display
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

  const [medias, setMedias] = useState<Media[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const onUpload = async (
    evt: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    const [file] = evt.target.files ?? [];
    if (!file) {
      console.warn("Should upload at least one file");
      return;
    }

    setIsConverting(true);
    setConversionProgress(0);

    let newName = file.name;
    let newNameSuffix = 1;
    while (medias.some((upload) => upload.name === newName)) {
      newName = `${file.name}_${newNameSuffix}`;
      newNameSuffix++;
    }

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
        fullCodecString: "avc1.42c01f",
      },
    });
    if (!conversion.isValid) throw new Error("conv is not valid");
    conversion.onProgress = setConversionProgress;
    await conversion.execute();

    const moshInput = new Input({
      formats: ALL_FORMATS,
      source: new BufferSource(x(convOutput.target.buffer)),
    });
    const track = x(await moshInput.getPrimaryVideoTrack());
    const decoderConfig = x(await track.getDecoderConfig());
    console.log(decoderConfig);
    const sink = new EncodedPacketSink(track);
    const pkts: EncodedPacket[] = [];
    for await (const pkt of sink.packets()) {
      pkts.push(pkt);
    }

    evt.target.value = "";
    setMedias([...medias, { name: newName, pkts }]);
    setIsConverting(false);
  };

  const [timeline, setTimeline] = useState<Clip[]>([]);

  return (
    <>
      <h1>Files</h1>
      <ul>
        {medias.map((upload) => (
          <li key={upload.name}>{upload.name}</li>
        ))}
        <li>
          <input
            type="file"
            accept="video/*"
            onChange={onUpload}
            disabled={isConverting}
          />
          {isConverting &&
            `Converting... (${Math.floor(100 * conversionProgress)}%)`}
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
                <option value={media.name}>{media.name}</option>
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

            {JSON.stringify(clip)}
          </li>
        ))}
        <li>
          <button
            onClick={() => {
              setTimeline([
                ...timeline,
                {
                  id: Math.random(),
                  name: medias[0].name,
                  effect: { kind: "copy", from: 0, to: medias[0].pkts.length },
                },
              ]);
            }}
          >
            add
          </button>
        </li>
      </ol>

      {videoSrc && <video src={videoSrc} controls autoPlay muted loop></video>}
    </>
  );
};
