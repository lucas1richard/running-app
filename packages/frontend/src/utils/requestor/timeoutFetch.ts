async function timeoutFetch(
  resource: Parameters<typeof fetch>[0],
  options: { timeout?: number } & Parameters<typeof fetch>[1] = { timeout: 8000 }
) {
  const { timeout = 8000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  clearTimeout(id);

  return response;
}

export default timeoutFetch;
