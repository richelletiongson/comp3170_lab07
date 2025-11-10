import './index.css'
import Book from './Book'
import Footer from './Footer'
import Header from './AppHeader'
import AddBook from './AddBook'
import Modal from './Modal'
import LoanManagement from './LoanManagement'
import { useState, useEffect } from 'react'

function App() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [showAddBook, setShowAddBook] = useState(false);
  const [showEditBook, setShowEditBook] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedPublisher, setSelectedPublisher] = useState('All');
  const [activeView, setActiveView] = useState('books'); // 'books' or 'loans'
  const [loans, setLoans] = useState([]);
  const [selectedBookDetails, setSelectedBookDetails] = useState(null);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [loadingSimilarBooks, setLoadingSimilarBooks] = useState(false);
  const [similarBooksError, setSimilarBooksError] = useState(null);

  useEffect(() => {
    const savedBooks = localStorage.getItem('books');
    if (savedBooks) {
      const parsedBooks = JSON.parse(savedBooks);
      setBooks(parsedBooks);
      setFilteredBooks(parsedBooks);
    } else {

      setBooks([]);
      setFilteredBooks([]);
    }
    
    const savedLoans = localStorage.getItem('loans');
    if (savedLoans) {
      const parsedLoans = JSON.parse(savedLoans);
      setLoans(parsedLoans);
    } else {
      setLoans([]);
    }
    
    setIsInitialized(true);
  }, []);

  
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('books', JSON.stringify(books));
    }
  }, [books, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('loans', JSON.stringify(loans));
    }
  }, [loans, isInitialized]);


  useEffect(() => {
    if (selectedPublisher === 'All') {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book => book.publisher === selectedPublisher);
      setFilteredBooks(filtered);
    }
  }, [books, selectedPublisher]);


  const handleNewButtonClick = () => {
    setShowAddBook(!showAddBook);
  };

  const handleEditButtonClick = () => {
    const selectedBook = books.find(book => book.selected);
    if (selectedBook) {
      setEditingBook(selectedBook);
      setShowEditBook(true);
    }
  };

  const handleAddBook = (newBook) => {
    const bookWithId = {
      id: `book_${Date.now()}_${Math.random()}`,
      ...newBook,
      selected: false
    };
    setBooks(prev => [...prev, bookWithId]);
    setShowAddBook(false);
  };

  const handleEditBook = (updatedBook) => {
    setBooks(prev => prev.map(book => 
      book.id === editingBook.id ? { ...updatedBook, id: editingBook.id, selected: false } : book
    ));
    setShowEditBook(false);
    setEditingBook(null);
  };

  const handleBookSelect = (bookId) => {
    setBooks(prev => prev.map(book => ({
      ...book,
      selected: book.id === bookId ? !book.selected : false 
    })));
  };

  const handleDeleteBook = () => {
    setBooks(prev => prev.filter(book => !book.selected));
  };

  const handlePublisherFilter = (e) => {
    setSelectedPublisher(e.target.value);
  };

  // Get unique publishers for the dropdown
  const getUniquePublishers = () => {
    const publishers = books.map(book => book.publisher).filter(Boolean);
    return [...new Set(publishers)];
  };

  // Get available books (not currently on loan)
  const getAvailableBooks = () => {
    const loanedBookIds = loans.map(loan => loan.bookId);
    return books.filter(book => !loanedBookIds.includes(book.id));
  };

  const handleAddLoan = (loanData) => {
    // Calculate due date based on loan period (in weeks)
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + (parseInt(loanData.loanPeriod) * 7));
    
    const newLoan = {
      id: `loan_${Date.now()}_${Math.random()}`,
      bookId: loanData.bookId,
      borrower: loanData.borrower,
      loanPeriod: loanData.loanPeriod,
      dueDate: dueDate.toISOString().split('T')[0],
      bookTitle: books.find(book => book.id === loanData.bookId)?.title || ''
    };
    setLoans(prev => [...prev, newLoan]);
  };

  const handleReturnLoan = (loanId) => {
    setLoans(prev => prev.filter(loan => loan.id !== loanId));
  };

  const handleViewDetails = (bookId) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      setSelectedBookDetails(book);
    }
  };

  const handleBackToList = () => {
    setSelectedBookDetails(null);
    setSimilarBooks([]);
    setSimilarBooksError(null);
  };

  // Fetch similar books when a book is selected for details view
  useEffect(() => {
    const fetchSimilarBooks = async () => {
      if (!selectedBookDetails || !selectedBookDetails.title) {
        setSimilarBooks([]);
        setSimilarBooksError(null);
        return;
      }

      setLoadingSimilarBooks(true);
      setSimilarBooksError(null);
      try {

        const query = encodeURIComponent(selectedBookDetails.title);
        const response = await fetch(`https://api.itbook.store/1.0/search/${query}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
     
        if (data.error) {
          throw new Error(data.error);
        }
        

        if (data.books && Array.isArray(data.books) && data.books.length > 0) {

          const filtered = data.books
            .filter(book => {
              // Skip invalid books
              if (!book || !book.title) {
                return false;
              }
              // Exclude if isbn13 matches (if current book has isbn13)
              if (selectedBookDetails.isbn13 && book.isbn13 && book.isbn13 === selectedBookDetails.isbn13) {
                return false;
              }
              // Also exclude if title exactly matches
              if (book.title && selectedBookDetails.title && 
                  book.title.toLowerCase() === selectedBookDetails.title.toLowerCase()) {
                return false;
              }
              return true;
            })
            .slice(0, 6);
          setSimilarBooks(filtered);
        } else {
          setSimilarBooks([]);
        }
      } catch (error) {
        console.error('Error fetching similar books:', error);
        setSimilarBooksError(error.message || 'Failed to load similar books');
        setSimilarBooks([]);
      } finally {
        setLoadingSimilarBooks(false);
      }
    };

    fetchSimilarBooks();
  }, [selectedBookDetails]);

  return (
    <div className="app">    
      <Header></Header>  
      <main className="main-content">
        {activeView === 'books' ? (
          selectedBookDetails ? (
            <div className="book-details-view">
              <div className="book-details-header">
                <div className="book-details-breadcrumb">
                  <span>Book / {selectedBookDetails.title}</span>
                </div>
                <button className="back-button" onClick={handleBackToList}>
                  BACK
                </button>
              </div>
              <div className="book-details-content">
                <div className="book-details-image-container">
                  <img 
                    src={selectedBookDetails.image} 
                    alt={selectedBookDetails.title} 
                    className="book-details-image"
                  />
                </div>
                <div className="book-details-info">
                  <h2 className="book-details-title">{selectedBookDetails.title}</h2>
                  <div className="book-details-list">
                    <div className="book-detail-item">
                      <strong>Author:</strong> <span>{selectedBookDetails.author || 'N/A'}</span>
                    </div>
                    <div className="book-detail-item">
                      <strong>Publisher:</strong> <span>{selectedBookDetails.publisher || 'N/A'}</span>
                    </div>
                    <div className="book-detail-item">
                      <strong>Published:</strong> <span>{selectedBookDetails.publicationYear || 'N/A'}</span>
                    </div>
                    <div className="book-detail-item">
                      <strong>Language:</strong> <span>{selectedBookDetails.language || 'N/A'}</span>
                    </div>
                    <div className="book-detail-item">
                      <strong>Pages:</strong> <span>{selectedBookDetails.pages || 'N/A'}</span>
                    </div>
                    {selectedBookDetails.price && (
                      <div className="book-detail-item">
                        <strong>Price:</strong> <span>{selectedBookDetails.price}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="similar-books-section">
                <h3 className="similar-books-title">Similar Books</h3>
                {loadingSimilarBooks ? (
                  <div className="similar-books-loading">Loading similar books...</div>
                ) : similarBooksError ? (
                  <div className="similar-books-error">Error: {similarBooksError}</div>
                ) : similarBooks.length > 0 ? (
                  <div className="similar-books-container">
                    {similarBooks.map((book, index) => (
                      <div key={book.isbn13 || `similar-book-${index}`} className="similar-book-card">
                        <div className="similar-book-image-container">
                          <img 
                            src={book.image || ''} 
                            alt={book.title || 'Book cover'} 
                            className="similar-book-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="similar-book-info">
                          <h4 className="similar-book-title">{book.title || 'Untitled'}</h4>
                          {book.subtitle && (
                            <p className="similar-book-subtitle">{book.subtitle}</p>
                          )}
                          {book.price && (
                            <p className="similar-book-price">{book.price}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="similar-books-empty">No similar books found.</div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="books-header-section">
                <button 
                  className="manage-loans-button"
                  onClick={() => setActiveView('loans')}
                >
                  MANAGE LOANS
                </button>
                <div className="filter-section">
                  <label htmlFor="publisher-filter">filter by publisher:</label>
                  <select 
                    id="publisher-filter"
                    value={selectedPublisher} 
                    onChange={handlePublisherFilter}
                    className="publisher-filter"
                  >
                    <option value="All">All</option>
                    {getUniquePublishers().map(publisher => (
                      <option key={publisher} value={publisher}>{publisher}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="content">
                <div className="new-button-column">
                  <button className="new" onClick={handleNewButtonClick}>NEW</button>
                  <button className="edit" onClick={handleEditButtonClick}>EDIT</button>
                  <button className="delete" onClick={handleDeleteBook}>DELETE</button>
                </div>
                
                <div className="books-container">
                  {filteredBooks.map((book) => {
                    const isOnLoan = loans.some(loan => loan.bookId === book.id);
                    return (
                      <Book 
                        key={book.id}
                        id={book.id}
                        title={book.title}
                        author={book.author}
                        publisher={book.publisher}
                        price={book.price}
                        image={book.image}
                        url={book.url}
                        selected={book.selected}
                        onSelect={handleBookSelect}
                        isOnLoan={isOnLoan}
                        onViewDetails={handleViewDetails}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          )
        ) : (
          <LoanManagement 
            onQuit={() => setActiveView('books')}
            availableBooks={getAvailableBooks()}
            loans={loans}
            onAddLoan={handleAddLoan}
            onReturnLoan={handleReturnLoan}
          />
        )}
        
        <Modal 
          isOpen={showAddBook} 
          onClose={() => setShowAddBook(false)}
          title="Add Book"
        >
          <AddBook onAddBook={handleAddBook} />
        </Modal>
        
        <Modal 
          isOpen={showEditBook} 
          onClose={() => setShowEditBook(false)}
          title="Edit Book"
        >
          <AddBook onAddBook={handleEditBook} initialData={editingBook} />
        </Modal>
      </main>
      <Footer></Footer>
    </div>
  );
}

export default App;
