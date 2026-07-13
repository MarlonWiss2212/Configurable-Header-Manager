/** Dumb I/O around fetch — returns the raw JSON body, no parsing into entities. */
import { DataError } from "@/src/data/errors/data-error";

export class RemoteRuleFileDataSource {
  async fetchJson(url: string): Promise<unknown> {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new DataError("Invalid URL - use the full address including https://");
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new DataError("Only http:// and https:// URLs are supported.");
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new DataError(`Server returned ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
