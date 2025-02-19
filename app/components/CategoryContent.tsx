import CategoryScroll from "./CategoryScroll"

export default function CategoryContent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">分野別のトラブル</h2>
      <CategoryScroll />
    </div>
  )
}

