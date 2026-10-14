// Submit and receipt queries must be tied to the exact attempt, not merely
// return matching arbitrary IDs. This shared check runs in both load clients.
export function assertReceiptMatches(response, attemptId) {
  const receipt = response?.receipt || response;
  if (!attemptId || receipt?.attemptId !== attemptId || receipt?.submissionId !== attemptId) {
    const error = new Error('Abgabe gehört nicht zum erwarteten Versuch.');
    error.code = 'receipt-attempt-mismatch';
    throw error;
  }
  return receipt;
}
