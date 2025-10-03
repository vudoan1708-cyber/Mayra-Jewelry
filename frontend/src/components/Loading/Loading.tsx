import { DotLottieReact } from '@lottiefiles/dotlottie-react';

type Resolution = {
  width?: number,
  height?: number,
};

export default function Loading({ width = 20, height = 20 }: Resolution) {
  return (
    <DotLottieReact
      src="https://lottie.host/af84b5a6-74cc-42f5-b6fa-10268ce91ab9/aFWRCbuQ0C.lottie"
      renderConfig={{ autoResize: true }}
      className={`w-${width.toString()} h-${height.toString()}`}
      loop
      autoplay
    />
  )
}
