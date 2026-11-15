import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type ApiItem = Record<string, unknown>;

type Props = {
  title: string;
  description: string;
  endpoint: string;
  responseKey: string;
  emptyMessage: string;
  renderItem: (item: ApiItem) => ReactNode;
};

function isApiItem(value: unknown): value is ApiItem {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function CapabilityCard({ title, description, endpoint, responseKey, emptyMessage, renderItem }: Props) {
  const [items, setItems] = useState<ApiItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setError(null);
    getJson<Record<string, unknown>>(endpoint)
      .then((response) => {
        const result = response[responseKey];
        if (!Array.isArray(result) || !result.every(isApiItem)) {
          throw new Error(`Invalid ${responseKey} response`);
        }
        if (!cancelled) setItems(result);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : 'Unexpected response error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [endpoint, responseKey]);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">{title}</h2>
    <p>{description}</p>
    {error ? <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>
      : items === null ? <p role="status">Loading {title.toLowerCase()}...</p>
        : items.length === 0 ? <p>{emptyMessage}</p>
          : <ul>{items.map((item, index) => <li key={String(item._id ?? index)}>{renderItem(item)}</li>)}</ul>}
  </div></section>;
}
