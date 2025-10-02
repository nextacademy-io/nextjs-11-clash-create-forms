import { ClashList } from '@/components/clash-list';

export default function ClashesPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Clashes</h1>
      <ClashList />
    </div>
  );
}
