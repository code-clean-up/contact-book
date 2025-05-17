type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageClick: (pageNumber: number) => void;
  children?: React.ReactNode;
};

export const Pagination = ({ currentPage, totalPages, onPageClick, children }: PaginationProps) => {
  if (totalPages <= 1) return null;

  function nextPage() {
    if (currentPage < totalPages) {
      onPageClick(currentPage + 1);
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      onPageClick(currentPage - 1);
    }
  }

  const pageButtons = [];
  for (let i = 0; i < totalPages; i++) {
    const pageNumber = i + 1;
    pageButtons.push(
      <button
        key={pageNumber}
        onClick={function () {
          onPageClick(pageNumber);
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
    <>
      <div className="flex justify-center items-center mt-10 gap-2">
        <button
          onClick={prevPage}
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
          onClick={nextPage}
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

      <div className="text-center mt-4 text-gray-400">{children}</div>
    </>
  );
};
