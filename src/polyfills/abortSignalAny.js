if (typeof AbortSignal !== "undefined" && !AbortSignal.any) {
  AbortSignal.any = function any(signals) {
    const controller = new AbortController();

    function onAbort(event) {
      const signal = event.target;

      if (!controller.signal.aborted) {
        controller.abort(signal.reason);
      }

      cleanup();
    }

    function cleanup() {
      signals.forEach((signal) => {
        signal.removeEventListener("abort", onAbort);
      });
    }

    signals.forEach((signal) => {
      if (signal.aborted) {
        controller.abort(signal.reason);
        cleanup();
        return;
      }

      signal.addEventListener("abort", onAbort);
    });

    return controller.signal;
  };
}
