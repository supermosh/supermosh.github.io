import { useState } from "react";

type Vid = {
  name: string; // unique
};

type Clip = {
  id: number;
  vid: string;
};

const mkClip = (vid: string): Clip => ({ id: Math.random(), vid });

const x = <T,>(value: T | null | undefined): T => {
  if (value == null) throw new Error("Should not be nullish");
  return value;
};

export const V3 = () => {
  const [vids, setVids] = useState([] as Vid[]);
  const [clips, setClips] = useState([] as Clip[]);

  return (
    <>
      <h1>Files</h1>
      <ul>
        {vids.map((vid) => (
          <li
            key={vid.name}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", vid.name);
            }}
            style={{ cursor: "grab" }}
          >
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
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const clipId = e.dataTransfer.getData("application/clip-id");
          if (clipId) {
            // Reorder: move clip to end
            const id = Number(clipId);
            setClips((prev) => {
              const clip = prev.find((c) => c.id === id);
              if (!clip) return prev;
              return [...prev.filter((c) => c.id !== id), clip];
            });
            return;
          }
          const name = e.dataTransfer.getData("text/plain");
          if (!name) return;
          // Drop on empty space -> append at end
          setClips((prev) => [...prev, mkClip(name)]);
        }}
        style={{
          display: "flex",
          minHeight: 50,
          border: "2px dashed #888",
          padding: 4,
          gap: 4,
          overflowX: "auto",
        }}
      >
        {clips.map((clip, i) => (
          <div
            key={clip.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("application/clip-id", String(clip.id));
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const clipId = e.dataTransfer.getData("application/clip-id");
              if (clipId) {
                // Reorder: move clip before this one
                const id = Number(clipId);
                if (id === clip.id) return;
                setClips((prev) => {
                  const moving = prev.find((c) => c.id === id);
                  if (!moving) return prev;
                  const without = prev.filter((c) => c.id !== id);
                  const idx = without.findIndex((c) => c.id === clip.id);
                  without.splice(idx, 0, moving);
                  return without;
                });
                return;
              }
              const dropName = e.dataTransfer.getData("text/plain");
              if (!dropName) return;
              // Insert new clip before this one
              setClips((prev) => {
                const next = [...prev];
                next.splice(i, 0, mkClip(dropName));
                return next;
              });
            }}
            style={{
              width: 200,
              minWidth: 200,
              height: 100,
              flexShrink: 0,
              background: "#444",
              cursor: "grab",
            }}
            title={clip.vid}
          >
            <div>{clip.vid}</div>
            <button
              onClick={() => {
                setClips(clips.filter((c) => c.id !== clip.id));
              }}
            >
              delete
            </button>
          </div>
        ))}
      </div>
      <h1>Render</h1>
      <p>TODO</p>
    </>
  );
};
