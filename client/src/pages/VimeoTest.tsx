import React from 'react'
// import GetVideosButton from '../components/Vimeo/GetVideosButton'
import VimeoLoginButton from '../components/Vimeo/VimeoLoginButton'
// import { useSelector } from 'react-redux'
import UploadVimeoVideoButton from '../components/Vimeo/UploadVimeoVideoButton'

const VimeoTest = () => {
  // const vimeoClient = useSelector((state: any) => state.vimeo.vimeoClient)
  return (
    <div>
      {/* <GetVideosButton vimeoClient={vimeoClient} playerId={"5db8c5b50732c12ec45dea44"} projectId={"5db55714119ad7212c9ea346"} auth={""} /> */}
      <VimeoLoginButton />
      <UploadVimeoVideoButton/>
    </div>
  )
}
VimeoTest.displayName = 'VimeoTest'
export default VimeoTest
