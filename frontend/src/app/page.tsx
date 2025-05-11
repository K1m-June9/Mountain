export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mountain 커뮤니티에 오신 것을 환영합니다</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Mountain은 공공기관 관련 정보를 공유하고 소통하는 커뮤니티입니다.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">최신 게시물</h2>
          <p className="text-gray-600 dark:text-gray-400">아직 게시물이 없습니다.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">공지사항</h2>
          <p className="text-gray-600 dark:text-gray-400">아직 공지사항이 없습니다.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">인기 게시물</h2>
          <p className="text-gray-600 dark:text-gray-400">아직 인기 게시물이 없습니다.</p>
        </div>
      </div>
    </div>
  )
}