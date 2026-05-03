import { useState, useCallback, useRef, useEffect } from "react";

const ITEMS_PER_PAGE = 20;

export const usePagination = (items) => {
  const [displayedItems, setDisplayedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const observerTargetRef = useRef(null);

  useEffect(() => {
    const itemsToDisplay = items.slice(0, currentPage * ITEMS_PER_PAGE);
    setDisplayedItems(itemsToDisplay);
  }, [items, currentPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          displayedItems.length < items.length
        ) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTargetRef.current) {
      observer.observe(observerTargetRef.current);
    }

    return () => {
      if (observerTargetRef.current) {
        observer.unobserve(observerTargetRef.current);
      }
    };
  }, [displayedItems.length, items.length]);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setDisplayedItems([]);
  }, []);

  const hasMore = displayedItems.length < items.length;

  return {
    displayedItems,
    observerTargetRef,
    hasMore,
    resetPagination,
  };
};
