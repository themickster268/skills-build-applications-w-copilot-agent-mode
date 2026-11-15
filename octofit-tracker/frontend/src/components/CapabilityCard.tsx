import type { ReactNode } from 'react';

type Props<T> = {
  title: string;
  description: string;
  items: T[] | null;
  loading: boolean;
  error: string | null;
  emptyMessage: string;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T>({
  title,
  description,
  items,
  loading,
  error,
  emptyMessage,
  renderItem,
}: Props<T>) {
  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">{title}</h2>
    <p>{description}</p>
    {error ? <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>
      : loading ? <p role="status">Loading {title.toLowerCase()}...</p>
        : items?.length === 0 ? <p>{emptyMessage}</p>
          : <ul>{items?.map((item, index) => <li key={index}>{renderItem(item)}</li>)}</ul>}
  </div></section>;
}
