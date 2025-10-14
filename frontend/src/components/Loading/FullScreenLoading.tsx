import ReactDOM from 'react-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function FullScreenLoading() {
  return (
    ReactDOM.createPortal(
      <div className="fixed top-0 left-0 w-dvw h-dvh bg-transparent-white flex justify-center items-center z-50">
        <DotLottieReact
          src="https://lottie.host/af84b5a6-74cc-42f5-b6fa-10268ce91ab9/aFWRCbuQ0C.lottie"
          renderConfig={{ autoResize: true }}
          className="w-20 h-20"
          loop
          autoplay
        />
      </div>,
      document.body,
    )
  )
}
