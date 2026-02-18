import { useState } from "react";

type Vid = {
  name: string; // unique
};

const x = <T,>(value: T | null | undefined): T => {
  if (value == null) throw new Error("Should not be nullish");
  return value;
};

export const V3 = () => {
  const [vids, setVids] = useState([] as Vid[]);
  return (
    <>
      <h1>Files</h1>
      <ul>
        {vids.map((vid) => (
          <li key={vid.name}>
            {vid.name}
            <button
              onClick={() => {
                setVids([...vids.filter((v) => v != vid)]);
              }}
            >
              delete
            </button>
          </li>
        ))}
        <li>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(evt) => {
              for (const file of x(evt.target.files)) {
                let name = file.name;
                let i = 0;
                while (vids.map((vid) => vid.name).includes(name)) {
                  name = `${name}_${i}`;
                  i++;
                }
                vids.push({ name });
              }
              setVids([...vids]);
              evt.target.value = "";
            }}
          />
        </li>
      </ul>
      <h1>Timeline</h1>
      <p>TODO</p>
      <h1>Render</h1>
      <p>TODO</p>
    </>
  );
};
