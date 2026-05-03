export default function Title() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg text-text font-body p-[4vw] flex flex-col">
      <div className="w-full h-full border-[0.2vw] border-text rounded-[1vw] bg-white flex flex-col shadow-[0.5vw_0.5vw_0_rgba(0,0,0,0.05)]">
        {/* Top chrome */}
        <div className="h-[6vh] border-b-[0.2vw] border-text flex items-center px-[2vw] gap-[1vw]">
          <div className="w-[1.5vw] h-[1.5vw] border-[0.15vw] border-text rounded-full" />
          <div className="w-[1.5vw] h-[1.5vw] border-[0.15vw] border-text rounded-full" />
          <div className="w-[1.5vw] h-[1.5vw] border-[0.15vw] border-text rounded-full" />
          <div className="flex-1" />
          <div className="text-[1.2vw] tracking-[0.1em] font-mono">[ dockerquest.app ]</div>
        </div>

        {/* Body */}
        <div className="flex-1 p-[4vw] flex relative">
          {/* Left text */}
          <div className="flex-1 flex flex-col justify-center z-10">
            <div className="border-[0.15vw] border-dashed border-muted px-[1vw] py-[0.5vw] rounded-[0.5vw] self-start mb-[3vh] text-[1vw] text-[#666666]">
              Build Story / v1.0
            </div>

            <h1 className="text-[6.5vw] font-light leading-[1.05] tracking-[-0.02em] m-0 underline decoration-[#cccccc] decoration-wavy underline-offset-[0.5vw]">
              DockerQuest
            </h1>

            <p className="text-[1.8vw] text-[#555555] mt-[4vh] max-w-[40vw] leading-[1.5] border-l-[0.4vw] border-[#e0e0e0] pl-[2vw]">
              An interactive Docker learning platform — and the story of how it shipped, bugs and all.
            </p>

            <div className="mt-[5vh] inline-flex self-start border-[0.2vw] border-text rounded-[0.5vw] bg-[#f0f0f0] px-[2.5vw] py-[1.2vw] text-[1.1vw] font-medium font-mono relative">
              [ press space to begin ]
              <div className="absolute -bottom-[1vw] -right-[1vw] w-[2vw] h-[2vw] border-l-[0.2vw] border-t-[0.2vw] border-black -rotate-12 z-20" />
            </div>
          </div>

          {/* Right image placeholder — Docker-shaped wireframe */}
          <div className="w-[34vw] h-full border-[0.2vw] border-text bg-[#fafafa] relative overflow-hidden flex items-center justify-center">
            <div className="absolute w-[150%] h-[0.15vw] bg-text rotate-45" />
            <div className="absolute w-[150%] h-[0.15vw] bg-text -rotate-45" />
            <div className="bg-white border-[0.15vw] border-text px-[2vw] py-[1vw] z-10 text-[1.4vw] font-mono shadow-[0.3vw_0.3vw_0_#eeeeee]">
              docker run -it dockerquest
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-[5vh] border-t-[0.2vw] border-text flex items-center justify-between px-[3vw] text-[1vw] text-muted">
          <div>DockerQuest · Build Notes</div>
          <div className="flex gap-[2vw]">
            <div>2026</div>
            <div>01</div>
          </div>
        </div>
      </div>
    </div>
  );
}
