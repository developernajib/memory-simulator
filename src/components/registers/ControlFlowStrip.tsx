// The PC / RSP / RBP / IR / decoder strip at the top of the register panel.
import type { RegisterFile, Step } from '../../types';

interface Props {
    R: RegisterFile;
    prev: RegisterFile | null;
    step: Step;
}

export function ControlFlowStrip({ R, prev, step }: Props) {
    const pcChg = prev && prev.pc !== R.pc ? ' chg' : '';
    const spChg = prev && prev.sp !== R.sp ? ' chg' : '';
    const bpChg = prev && prev.bp !== R.bp ? ' chg' : '';
    const irChg = prev && prev.ir !== R.ir ? ' chg' : '';

    return (
        <div className="cf-regs">
            <div
                className={`cf-reg${pcChg} tip`}
                data-tip={`RIP = the Program Counter. It holds the ADDRESS of the next instruction to run. After each instruction the CPU advances it automatically; jumps, calls and returns change it. You cannot write it directly.\nNow pointing into: ${R.fn}`}
            >
                <div className="cf-reg-k">
                    <b>RIP</b>
                    <span className="alias">Program Counter / PC</span>
                </div>
                <div className="cf-reg-v ptr">{R.pc}</div>
                <div className="cf-reg-note">→ {R.fn}</div>
            </div>

            <div
                className={`cf-reg${spChg} tip`}
                data-tip={`RSP = the Stack Pointer. It always points at the TOP of the stack (the most recent item). Calling a function pushes data and moves RSP DOWN; returning pops it back UP. ${step.stackB || 0} bytes are in use this step.`}
            >
                <div className="cf-reg-k">
                    <b>RSP</b>
                    <span className="alias">Stack Pointer</span>
                </div>
                <div className="cf-reg-v ptr">{R.sp}</div>
                <div className="cf-reg-note">{step.stackB || 0} B used · grows ↓</div>
            </div>

            <div
                className={`cf-reg${bpChg} tip`}
                data-tip={`RBP = the Base (Frame) Pointer. It marks the START of the current function’s stack frame, giving a fixed anchor to reach local variables and arguments even while RSP keeps moving. Set up on entry, restored on return.\nFrame: ${step.fn || '—'}`}
            >
                <div className="cf-reg-k">
                    <b>RBP</b>
                    <span className="alias">Base / Frame Pointer</span>
                </div>
                <div className="cf-reg-v ptr">{R.bp}</div>
                <div className="cf-reg-note">frame base of {step.fn || '—'}</div>
            </div>

            <div
                className={`cf-reg${irChg} tip`}
                data-tip={`IR = the Instruction Register. After fetch, the CPU latches the raw instruction here so the decoder can read it. This is the single instruction being executed RIGHT NOW: ${R.ir}`}
            >
                <div className="cf-reg-k">
                    <b>IR</b>
                    <span className="alias">Instruction Register</span>
                </div>
                <div className="cf-reg-v">{R.ir}</div>
                <div className="cf-reg-note">latched opcode being executed</div>
            </div>

            <div
                className="cf-reg wide tip"
                data-tip="The DECODER is the part of the CPU that reads the instruction in IR, works out what it does, and breaks it into tiny internal steps (micro-ops) for the execution units (ALU = arithmetic, AGU = address math). After it finishes, the result is written back to a register and RIP moves on."
            >
                <div className="cf-reg-k">
                    <b>DECODER</b>
                    <span className="alias">fetch → decode → execute → writeback</span>
                </div>
                <div className="cf-reg-v txt">
                    {R.fn} @ {R.pc} → decode <b style={{ color: 'var(--yellow)' }}>{R.ir}</b> → µops
                    → ALU/AGU
                    {R.writes && (
                        <>
                            {' '}
                            → writeback to <b style={{ color: 'var(--green)' }}>{R.writes}</b>
                        </>
                    )}{' '}
                    · then RIP auto-advances to next instruction
                </div>
            </div>
        </div>
    );
}
