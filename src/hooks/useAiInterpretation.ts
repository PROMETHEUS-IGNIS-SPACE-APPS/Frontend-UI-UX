import { useMutation } from '@tanstack/react-query';
import { explainWithAi, type AiExplainResult, type AiMode } from '@/services/api/aiService';

/** Estado compartido entre el botón "Interpretar con IA" y su panel de resultados. */
export function useAiInterpretation(mode: AiMode) {
  return useMutation<AiExplainResult, Error, Record<string, unknown>>({
    mutationFn: (payload) => explainWithAi(mode, payload),
  });
}

export type AiInterpretationState = ReturnType<typeof useAiInterpretation>;
