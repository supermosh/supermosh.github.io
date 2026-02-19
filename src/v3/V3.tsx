import { ALL_FORMATS, BlobSource, Input, VideoSampleSink } from "mediabunny";
import { useEffect, useRef, useState } from "react";

type Vid = {
  file: File;
  /** Unique identifier and UI label */
  name: string;
  /**
   * URL of first video frame
   * TODO optimize image size
   */
  poster: string;
};

type Clip = {
  id: number;
  vid: Vid;
  from: number;
  to: number;
};

const TMP_DURATION = 200;

const mkClip = (vid: Vid): Clip => ({
  id: Math.random(),
  vid,
  from: 0,
  to: TMP_DURATION,
});

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

const x = <T,>(value: T | null | undefined): T => {
  if (value == null) throw new Error("Should not be nullish");
  return value;
};

export const V3 = () => {
  const [vids, setVids] = useState([] as Vid[]);
  const [clips, setClips] = useState([] as Clip[]);
  const [zoom, setZoom] = useState(1); // pixels per frame
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      e.stopPropagation();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((prev) => Math.max(0.05, Math.min(20, prev * factor)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

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
            <button
              onClick={() => {
                setVids([...vids.filter((v) => v != vid)]);
              }}
            >
              delete
            </button>
            <img src={vid.poster} style={{ height: 50 }} />
            <span>{vid.name}</span>
          </li>
        ))}
        <li>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={async (evt) => {
              for (const file of x(evt.target.files)) {
                let name = file.name;
                let i = 0;
                while (vids.map((vid) => vid.name).includes(name)) {
                  name = `${name}_${i}`;
                  i++;
                }
                const poster = await getPoster(file);
                vids.push({ name, file, poster });
                setVids([...vids]);
              }
              evt.target.value = "";
            }}
          />
        </li>
      </ul>
      <h1>Timeline</h1>
      <div
        ref={timelineRef}
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
          const vid = vids.find((v) => v.name === name);
          if (!vid) return;
          setClips((prev) => [...prev, mkClip(vid)]);
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
              const vid = vids.find((v) => v.name === dropName);
              if (!vid) return;
              // Insert new clip before this one
              setClips((prev) => {
                const next = [...prev];
                next.splice(i, 0, mkClip(vid));
                return next;
              });
            }}
            style={{
              width: zoom * (clip.to - clip.from),
              minWidth: zoom * (clip.to - clip.from),
              height: 100,
              flexShrink: 0,
              cursor: "grab",
              backgroundImage: `url(${clip.vid.poster})`,
              backgroundSize: "contain",
              backgroundRepeat: "repeat-x",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* only debug infos for now */}
            <div>{clip.vid.name}</div>
            <a href={clip.vid.poster}>poster</a>
            <button
              onClick={() => {
                setClips(clips.filter((c) => c.id !== clip.id));
              }}
            >
              delete
            </button>
            {/* Left trim handle */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 8,
                height: "100%",
                cursor: "ew-resize",
                background: "rgba(255,255,255,0.3)",
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const startX = e.clientX;
                const startFrom = clip.from;
                const onMouseMove = (ev: MouseEvent) => {
                  const dx = ev.clientX - startX;
                  const dFrames = dx / zoom;
                  const newFrom = Math.max(
                    0,
                    Math.min(clip.to - 1, Math.round(startFrom + dFrames)),
                  );
                  setClips((prev) =>
                    prev.map((c) =>
                      c.id === clip.id ? { ...c, from: newFrom } : c,
                    ),
                  );
                };
                const onMouseUp = () => {
                  document.removeEventListener("mousemove", onMouseMove);
                  document.removeEventListener("mouseup", onMouseUp);
                };
                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
              }}
              draggable
              onDragStart={(e) => e.preventDefault()}
            />
            {/* Right trim handle */}
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: 8,
                height: "100%",
                cursor: "ew-resize",
                background: "rgba(255,255,255,0.3)",
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const startX = e.clientX;
                const startTo = clip.to;
                const onMouseMove = (ev: MouseEvent) => {
                  const dx = ev.clientX - startX;
                  const dFrames = dx / zoom;
                  const newTo = Math.min(
                    TMP_DURATION,
                    Math.max(clip.from + 1, Math.round(startTo + dFrames)),
                  );
                  setClips((prev) =>
                    prev.map((c) =>
                      c.id === clip.id ? { ...c, to: newTo } : c,
                    ),
                  );
                };
                const onMouseUp = () => {
                  document.removeEventListener("mousemove", onMouseMove);
                  document.removeEventListener("mouseup", onMouseUp);
                };
                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
              }}
              // Prevent this handle from initiating a clip drag
              draggable
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
        ))}
      </div>
      <h1>Edit</h1>
      <p>TODO</p>
      <h1>Render</h1>
      <p>TODO</p>
    </>
  );
};
