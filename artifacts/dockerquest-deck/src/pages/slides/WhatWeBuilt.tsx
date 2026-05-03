import firstPromptShot from "@assets/image_1777768736650.png";

export default function WhatWeBuilt() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg text-text font-body p-[4vw] flex flex-col">
      <div className="w-full h-full border-[0.2vw] border-text rounded-[1vw] bg-white flex flex-col shadow-[0.5vw_0.5vw_0_rgba(0,0,0,0.05)]">
        <div className="h-[6vh] border-b-[0.2vw] border-text flex items-center px-[2vw] gap-[1vw]">
          <div className="w-[1.5vw] h-[1.5vw] border-[0.15vw] border-text rounded-full" />
          <div className="w-[1.5vw] h-[1.5vw] border-[0.15vw] border-text rounded-full" />
          <div className="w-[1.5vw] h-[1.5vw] border-[0.15vw] border-text rounded-full" />
          <div className="flex-1" />
          <div className="text-[1.2vw] tracking-[0.1em] font-mono">[ message 01 of 5 ]</div>
        </div>

        <div className="flex-1 p-[3vw] flex gap-[3vw]">
          {/* Left: context */}
          <div className="w-[32vw] flex flex-col justify-center">
            <div className="text-[1vw] font-mono text-[#888888] mb-[1.5vh] tracking-[0.1em]">[ the very first message ]</div>
            <h2 className="text-[3.6vw] font-light leading-[1.05] tracking-[-0.02em] m-0 underline decoration-[#cccccc] decoration-wavy underline-offset-[0.5vw]">
              How it started
            </h2>
            <p className="text-[1.4vw] text-[#555555] mt-[3vh] leading-[1.5] border-l-[0.4vw] border-[#e0e0e0] pl-[1.5vw]">
              One paragraph. One link to <span className="font-mono text-[1.2vw]">learngitbranching.js.org</span> as inspiration. That was the whole brief.
            </p>
            <div className="mt-[3vh] text-[1.1vw] text-[#666666] leading-[1.6]">
              Nine messages and fifty actions later, the "Docker Learning Platform" was open in the preview pane.
            </div>
          </div>

          {/* Right: actual screenshot */}
          <div className="flex-1 border-[0.2vw] border-text rounded-[0.5vw] bg-[#fafafa] p-[1.5vw] flex items-center justify-center relative shadow-[0.4vw_0.4vw_0_#eeeeee]">
            <img
              src={firstPromptShot}
              alt="Original chat prompt requesting an interactive Docker learning platform inspired by learngitbranching.js.org"
              className="max-w-full max-h-full object-contain border-[0.15vw] border-[#cccccc] rounded-[0.3vw]"
            />
            {/* Annotation cursor */}
            <div className="absolute -top-[1vw] -left-[1vw] w-[2vw] h-[2vw] border-l-[0.2vw] border-t-[0.2vw] border-black -rotate-12 z-20" />
            <div className="absolute -bottom-[2vh] left-[2vw] text-[0.95vw] font-mono text-[#888888] bg-white px-[0.8vw] py-[0.3vh] border-[0.15vw] border-dashed border-[#888888] rounded-[0.3vw]">
              actual chat · 4 hours ago
            </div>
          </div>
        </div>

        <div className="h-[5vh] border-t-[0.2vw] border-text flex items-center justify-between px-[3vw] text-[1vw] text-muted">
          <div>DockerQuest · Build Notes</div>
          <div className="flex gap-[2vw]">
            <div>2026</div>
            <div>02</div>
          </div>
        </div>
      </div>
    </div>
  );
}
