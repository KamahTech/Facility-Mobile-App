export type WorkflowSideEffectResult = {
  sideEffectError: unknown | null;
};

export async function runWorkflowWithSideEffect(
  action: () => Promise<unknown>,
  sideEffect: () => Promise<unknown>,
): Promise<WorkflowSideEffectResult> {
  await action();

  try {
    await sideEffect();
    return { sideEffectError: null };
  } catch (sideEffectError) {
    return { sideEffectError };
  }
}
