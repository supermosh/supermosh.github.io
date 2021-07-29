import React, { useState } from 'react';
import { Output } from './types';
import Modal from './Modal';

const computeReadableSize = (size: number) => {
  if (size < 1024) return `${size}b`;
  if (size < 1024 * 1024) return `${Math.floor(size / 1024)}Kb`;
  return `${Math.floor(size / 1024)}Mb`;
};

export default ({ output }: {output: Output}) => {
  const [previewingVideo, setPreviewingVideo] = useState<boolean>(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [previewingImage, setPreviewingImage] = useState<boolean>(false);

  if (output === null) {
    return (
      <div className="Result-empty">
        <p>No output yet rendered</p>
      </div>
    );
  }

  const readableVideoDuration = [
    videoDuration >= 3600 && `${Math.floor(videoDuration / 3600)}h`,
    videoDuration >= 60 && `${Math.floor((videoDuration % 3600) / 60)}mn`,
    `${Math.floor(videoDuration % 60)}s`,
  ].filter(Boolean).join('');
  const readableVideoSize = computeReadableSize(output.videoSize);
  const readableImageSize = computeReadableSize(output.imageSize);

  return (
    <div className="Result-done">
      <div className="desc">
        <div>Video</div>
        <div>{`${output.width}x${output.height}`}</div>
        <div>{readableVideoDuration}</div>
        <div>{readableVideoSize}</div>
        <div>{`type: ${output.videoType}`}</div>
      </div>
      <div>
        <video
          className="thumb"
          src={output.videoUrl}
          muted
          autoPlay
          loop
          onClick={() => setPreviewingVideo(true)}
          title="Click to preview"
          onCanPlay={(evt) => setVideoDuration((evt.target as HTMLVideoElement).duration)}
        />

      </div>
      <div className="desc">
        <div>Last frame</div>
        <div>{`${output.width}x${output.height}`}</div>
        <div>{readableImageSize}</div>
        <div>{`type: ${output.imageUrl.split(';')[0].split(':')[1]}`}</div>
        {output.imageUrl.length}
      </div>
      <div>
        <img
          className="thumb"
          src={output.imageUrl}
          alt=""
          onClick={() => setPreviewingImage(true)}
        />

      </div>

      {previewingVideo && (
        <Modal onClose={() => setPreviewingVideo(false)}>
          <video className="preview" src={output.videoUrl} autoPlay controls loop />
        </Modal>
      )}
      {previewingImage && (
        <Modal onClose={() => setPreviewingImage(false)}>
          <img className="preview" src={output.imageUrl} alt="" />
        </Modal>
      )}
    </div>
  );
};
