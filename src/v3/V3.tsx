import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
} from "mediabunny";

export const V3 = () => {
  const scratch = async (
    evt: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    const [file] = evt.target.files ?? [];
    if (!file) throw new Error("Should be a file");
    console.log({ file });

    // convert
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
    conversion.onProgress = (n) => console.log(`conv progress ${~~(100 * n)}%`);
    await conversion.execute();
  };

  return (
    <>
      <input type="file" accept="video/*" onChange={scratch} />
    </>
  );
};
