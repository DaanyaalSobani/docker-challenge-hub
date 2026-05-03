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
              Build log / chat transcript
            </div>

            <h1 className="text-[6.5vw] font-light leading-[1.05] tracking-[-0.02em] m-0 underline decoration-[#cccccc] decoration-wavy underline-offset-[0.5vw]">
              DockerQuest
            </h1>

            <p className="text-[1.8vw] text-[#555555] mt-[4vh] max-w-[40vw] leading-[1.5] border-l-[0.4vw] border-[#e0e0e0] pl-[2vw]">
              One conversation. One app.<br />Here is how it actually went.
            </p>

            <div className="mt-[5vh] inline-flex self-start border-[0.2vw] border-text rounded-[0.5vw] bg-[#f0f0f0] px-[2.5vw] py-[1.2vw] text-[1.1vw] font-medium font-mono relative">
              [ scroll the thread ]
              <div className="absolute -bottom-[1vw] -right-[1vw] w-[2vw] h-[2vw] border-l-[0.2vw] border-t-[0.2vw] border-black -rotate-12 z-20" />
            </div>
          </div>

          {/* Right: stylized chat preview */}
          <div className="w-[34vw] h-full border-[0.2vw] border-text bg-[#fafafa] relative overflow-hidden flex flex-col p-[2vw] gap-[1.5vh]">
            <div className="self-end max-w-[80%] border-[0.15vw] border-text bg-[#f0f0f0] rounded-[0.5vw] px-[1.2vw] py-[1vh] text-[1vw] font-mono">
              you: build me a Docker learning app
            </div>
            <div className="self-start max-w-[80%] border-[0.15vw] border-dashed border-text bg-white rounded-[0.5vw] px-[1.2vw] py-[1vh] text-[1vw] font-mono">
              agent: on it.
            </div>
            <div className="self-end max-w-[80%] border-[0.15vw] border-text bg-[#f0f0f0] rounded-[0.5vw] px-[1.2vw] py-[1vh] text-[1vw] font-mono">
              you: add sign-in
            </div>
            <div className="self-start max-w-[80%] border-[0.15vw] border-dashed border-text bg-white rounded-[0.5vw] px-[1.2vw] py-[1vh] text-[1vw] font-mono">
              agent: shipped + 2 bugs caught
            </div>
            <div className="self-end max-w-[80%] border-[0.15vw] border-text bg-[#f0f0f0] rounded-[0.5vw] px-[1.2vw] py-[1vh] text-[1vw] font-mono">
              you: now make a deck about it
            </div>
            <div className="self-start max-w-[80%] border-[0.15vw] border-dashed border-text bg-white rounded-[0.5vw] px-[1.2vw] py-[1vh] text-[1vw] font-mono">
              agent: this one. hi.
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
