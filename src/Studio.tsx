import React, { useState } from 'react';

type Media = {
  file: File;
  url: string;
}

export default () => {
  // @ts-ignore debug
  const [media, setMedia] = useState<Media[]>([{ url: '/media/bg.webm', file: { name: 'my-video.mp4' } }, { url: '/media/bg.webm', file: { name: 'my-videooooooooooooooooooooooooo.mp4' } }]);
  const addFile = (evt) => {
    const file = evt.target.files[0] as File;
    const url = URL.createObjectURL(file);
    setMedia([...media, { file, url }]);
  };
  return (
    <div className="Studio">
      <div className="" />
      <div className="" />
      <div className="files">
        <div>FILES</div>
        {media.length === 0 ? (
          <div>No video uploaded yet</div>
        ) : (
          media.map(({ file, url }) => (
            <div key={url} className="media">
              <video src={url} muted loop autoPlay title={`preview ${file.name}`} />
              <span className="name" title={file.name}>{file.name}</span>
              <button type="button" title="delete"><img src="/icons/delete.svg" alt="delete video" /></button>
            </div>
          ))
        )}
        <div>
          Add video:&nbsp;
          <input type="file" accept="video/*" onInput={addFile} />
        </div>
      </div>
      <div className="" />
    </div>
  );
};
