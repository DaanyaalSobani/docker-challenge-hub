export default function Architecture() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg text-text font-body p-[4vw] flex flex-col">
      <div className="w-full h-full border-[0.2vw] border-text rounded-[1vw] bg-white flex flex-col shadow-[0.5vw_0.5vw_0_rgba(0,0,0,0.05)]">
        <div className="h-[6vh] border-b-[0.2vw] border-text flex items-center px-[2vw] gap-[1vw]">
          <div className="w-[1.5vw] h-[1.5vw] border-[0.15vw] border-text rounded-full" />
          <div className="w-[1.5vw] h-[1.5vw] border-[0.15vw] border-text rounded-full" />
          <div className="w-[1.5vw] h-[1.5vw] border-[0.15vw] border-text rounded-full" />
          <div className="flex-1" />
          <div className="text-[1.2vw] tracking-[0.1em] font-mono">[ dockerquest.app ]</div>
        </div>

        <div className="flex-1 p-[4vw] flex flex-col">
          <h2 className="text-[3.8vw] font-light leading-[1.1] tracking-[-0.02em] m-0 underline decoration-[#cccccc] decoration-wavy underline-offset-[0.5vw]">
            How it fits together
          </h2>
          <p className="text-[1.4vw] text-[#666666] mt-[2vh] max-w-[60vw]">
            One pnpm monorepo. Three artifacts. One contract between them.
          </p>

          {/* Diagram */}
          <div className="flex-1 mt-[5vh] border-[0.15vw] border-dashed border-text rounded-[0.5vw] p-[3vw] flex items-center justify-center gap-[3vw] relative">
            {/* Frontend box */}
            <div className="flex-1 max-w-[20vw] border-[0.2vw] border-text rounded-[0.5vw] bg-[#fafafa] p-[1.5vw] flex flex-col items-center text-center">
              <div className="text-[1vw] font-mono text-[#888888]">artifacts/</div>
              <div className="text-[1.6vw] font-medium mt-[0.5vh]">docker-learn</div>
              <div className="text-[1vw] text-[#666666] mt-[1.5vh] leading-[1.5]">React + Vite frontend. Editor, challenge map, progress UI.</div>
            </div>

            <div className="text-[1.5vw] font-mono text-[#888888]">&lt;----&gt;</div>

            {/* Spec box (the contract) */}
            <div className="flex-1 max-w-[18vw] border-[0.2vw] border-dashed border-text rounded-[0.5vw] bg-white p-[1.5vw] flex flex-col items-center text-center">
              <div className="text-[1vw] font-mono text-[#888888]">lib/</div>
              <div className="text-[1.6vw] font-medium mt-[0.5vh]">api-spec</div>
              <div className="text-[1vw] text-[#666666] mt-[1.5vh] leading-[1.5]">OpenAPI generates typed hooks and Zod schemas for both sides.</div>
            </div>

            <div className="text-[1.5vw] font-mono text-[#888888]">&lt;----&gt;</div>

            {/* Backend box */}
            <div className="flex-1 max-w-[20vw] border-[0.2vw] border-text rounded-[0.5vw] bg-[#fafafa] p-[1.5vw] flex flex-col items-center text-center">
              <div className="text-[1vw] font-mono text-[#888888]">artifacts/</div>
              <div className="text-[1.6vw] font-medium mt-[0.5vh]">api-server</div>
              <div className="text-[1vw] text-[#666666] mt-[1.5vh] leading-[1.5]">Express + Postgres. Auth, sessions, progress storage.</div>
            </div>

            {/* Cursor highlighting the contract */}
            <div className="absolute top-[12%] left-[48%] w-[2vw] h-[2vw] border-l-[0.2vw] border-t-[0.2vw] border-black rotate-45 z-20" />
          </div>
        </div>

        <div className="h-[5vh] border-t-[0.2vw] border-text flex items-center justify-between px-[3vw] text-[1vw] text-muted">
          <div>DockerQuest · Build Notes</div>
          <div className="flex gap-[2vw]">
            <div>2026</div>
            <div>03</div>
          </div>
        </div>
      </div>
    </div>
  );
}
