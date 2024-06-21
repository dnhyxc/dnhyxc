import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export const translateWebmToMp4 = async (file: File | Blob | string) => {
  const ffmpeg = new FFmpeg();
  // const isDev = import.meta.env.DEV;
  ffmpeg.on('log', (e) => {
    console.log(e.message);
  });

  await ffmpeg.load({
    coreURL: await toBlobURL('./ffmpeg-core.js', 'text/javascript'),
    wasmURL: await toBlobURL('./ffmpeg-core.wasm', 'application/wasm'),
  });
  await ffmpeg.writeFile('input.webm', await fetchFile(file));
  await ffmpeg.exec(['-i', 'input.webm', 'output.mp4']);
  const data = await ffmpeg.readFile('output.mp4');
  const exportPath = URL.createObjectURL(new Blob([(data as Uint8Array).buffer], { type: 'video/mp4' }));
  return exportPath;
};
