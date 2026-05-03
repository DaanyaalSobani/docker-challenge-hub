export default function BugsWeCaught() {
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
            Bugs the review caught
          </h2>
          <p className="text-[1.4vw] text-[#666666] mt-[2vh] max-w-[60vw]">
            Two real issues turned up after the first pass — both fixed before shipping.
          </p>

          <div className="flex flex-col gap-[2.5vh] flex-1 mt-[4vh]">
            {/* Bug 1 */}
            <div className="border-[0.2vw] border-text rounded-[0.5vw] bg-white p-[2vw] flex gap-[2vw] items-start">
              <div className="text-[2.5vw] font-mono font-medium text-[#888888] leading-none">01</div>
              <div className="flex-1">
                <div className="text-[1.8vw] font-medium">CORS too open</div>
                <div className="text-[1.15vw] text-[#666666] mt-[1vh] leading-[1.5]">
                  We started with <span className="font-mono text-[1.05vw]">cors(&#123; origin: true, credentials: true &#125;)</span>, which lets any site send authenticated calls to our API. Tightened the allowlist to the deployment's own domains.
                </div>
              </div>
            </div>

            {/* Bug 2 */}
            <div className="border-[0.2vw] border-text rounded-[0.5vw] bg-[#fafafa] p-[2vw] flex gap-[2vw] items-start">
              <div className="text-[2.5vw] font-mono font-medium text-[#888888] leading-none">02</div>
              <div className="flex-1">
                <div className="text-[1.8vw] font-medium">Silent progress loss on first login</div>
                <div className="text-[1.15vw] text-[#666666] mt-[1vh] leading-[1.5]">
                  The migration cleared local progress before checking that the server actually accepted the upload. A failed PUT would have wiped your only copy. Now the local cache is only cleared on a confirmed 2xx.
                </div>
              </div>
            </div>

            {/* Bonus */}
            <div className="border-[0.15vw] border-dashed border-muted rounded-[0.5vw] bg-white p-[1.5vw] flex gap-[2vw] items-center text-[1.05vw] text-[#666666]">
              <div className="font-mono text-[#888888]">[ also ]</div>
              <div>The old <span className="font-mono">user_progress</span> table had a stale shape from an earlier prototype — dropped and rebuilt before the schema push.</div>
            </div>
          </div>
        </div>

        <div className="h-[5vh] border-t-[0.2vw] border-text flex items-center justify-between px-[3vw] text-[1vw] text-muted">
          <div>DockerQuest · Build Notes</div>
          <div className="flex gap-[2vw]">
            <div>2026</div>
            <div>05</div>
          </div>
        </div>
      </div>
    </div>
  );
}
