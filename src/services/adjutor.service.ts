import axios from "axios";
import { env } from "../config/env";

type KarmaResponse = {
  status?: string;
  data?: unknown;
};

export const isBlacklisted = async (identity: string): Promise<boolean> => {
  if (!env.adjutorApiKey || env.nodeEnv === "test") {
    return false;
  }

  try {
    const response = await axios.get<KarmaResponse>(
      `${env.adjutorBaseUrl}/v2/verification/karma/${encodeURIComponent(identity)}`,
      {
        headers: {
          Authorization: `Bearer ${env.adjutorApiKey}`,
        },
      },
    );

    return Boolean(response.data?.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return false;
    }

    throw error;
  }
};
