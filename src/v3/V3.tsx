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

  return (
    <>
      <input type="file" accept="video/*" onChange={scratch} />
      {videoSrc && <video src={videoSrc} controls autoPlay muted loop></video>}
    </>
  );
};
