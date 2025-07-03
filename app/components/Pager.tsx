type PagerProps = {
  currentPage: number;
  totalPages: number;
  goToPage: (pageNumber: number) => void;
};

export default function Pager({ currentPage, totalPages, goToPage }: PagerProps) {
  function onNextPage() {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }

  function onPrevPage() {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }

  const pageButtons = [];

  for (let i = 0; i < totalPages; i++) {
    const pageNumber = i + 1;
    pageButtons.push(
      <button
        key={pageNumber}
        onClick={function () {
          goToPage(pageNumber);
        }}
        className={
          currentPage === pageNumber
            ? 'w-10 h-10 flex justify-center items-center rounded-md text-sm bg-purple-600 text-white cursor-pointer'
            : 'w-10 h-10 flex justify-center items-center rounded-md text-sm bg-gray-700 text-gray-200 hover:bg-gray-600 cursor-pointer'
        }
      >
        {pageNumber}
      </button>
    );
  }

  return (
    <div className="flex justify-center items-center mt-10 gap-2">
      <button
        onClick={onPrevPage}
        disabled={currentPage === 1}
        className={
          currentPage === 1
            ? 'px-4 py-2 rounded-md text-sm bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'px-4 py-2 rounded-md text-sm bg-gray-700 text-gray-200 hover:bg-gray-600 cursor-pointer'
        }
      >
        Previous
      </button>

      <div className="flex gap-2">{pageButtons}</div>

      <button
        onClick={onNextPage}
        disabled={currentPage === totalPages}
        className={
          currentPage === totalPages
            ? 'px-4 py-2 rounded-md text-sm bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'px-4 py-2 rounded-md text-sm bg-gray-700 text-gray-200 hover:bg-gray-600 cursor-pointer'
        }
      >
        Next
      </button>
    </div>
  );
}
