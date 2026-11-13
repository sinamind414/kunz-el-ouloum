/* Pipeline arrangement scoring is deliberately separate from text evaluation. */
export function evaluatePipeline(blocksBank, arrangement) {
  const expectedTotal = Array.isArray(blocksBank) ? blocksBank.length : 0;
  let exactMatches = 0;
  let weightedScore = 0;
  const wrongSlots = [];
  const missingSlots = [];
  const streamBreakdown = {
    1: { exact: 0, partial: 0, missing: 0 },
    2: { exact: 0, partial: 0, missing: 0 }
  };

  for (const [key, arr] of Object.entries(arrangement || {})) {
    const streamIdx = key === "stream1" ? 1 : 2;
    const expectedLength = (arr || []).length;

    for (let slot = 0; slot < expectedLength; slot++) {
      const blockId = arr[slot];
      if (!blockId) {
        missingSlots.push({ stream: streamIdx, slot });
        streamBreakdown[streamIdx].missing++;
        continue;
      }

      const blk = blocksBank.find((b) => b.id === blockId);
      const blkStream = blk ? (blk.stream ?? blk.correctStream) : null;
      const blkSlot = blk ? (blk.slot ?? blk.correctSlot) : null;

      if (blk && blkStream === streamIdx && blkSlot === slot) {
        exactMatches++;
        weightedScore += 1;
        streamBreakdown[streamIdx].exact++;
      } else if (blk && blkStream === streamIdx) {
        weightedScore += 0.5;
        streamBreakdown[streamIdx].partial++;
        wrongSlots.push({ stream: streamIdx, slot, id: blockId, reason: "wrong-order" });
      } else {
        wrongSlots.push({ stream: streamIdx, slot, id: blockId, reason: "wrong-stream" });
      }
    }
  }

  return {
    correct: exactMatches,
    total: expectedTotal,
    fraction: expectedTotal ? Math.min(1, weightedScore / expectedTotal) : 0,
    weightedScore,
    wrongSlots,
    missingSlots,
    streamBreakdown
  };
}
