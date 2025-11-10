import './index.css'

function Book(props) {

    const handleCardClick = () => {
        if (props.onSelect && props.id) {
            props.onSelect(props.id);
        }
    };

    const handleDetailsClick = (e) => {
        e.stopPropagation(); // Prevent card selection when clicking details button
        if (props.onViewDetails && props.id) {
            props.onViewDetails(props.id);
        }
    };

    return (
        <div className={`book${props.selected ? ' selected' : ''}${props.isOnLoan ? ' on-loan' : ''}`} onClick={handleCardClick}>
            {props.isOnLoan && (
                <div className="book-loan-badge">
                    <p>On loan</p>
                </div>
            )}
            <div className="book-image-container">
                <img src={props.image} alt={props.title} className="book-image" />
            </div>
            <div className="book-title">
                <h3>{props.title}</h3>
            </div>
            <div className="book-author">
                <p>by {props.author}</p>
            </div>
            <div className="book-publisher">
                <p>{props.publisher}</p>
            </div>
            <div className="book-price">
                <p>{props.price}</p>
            </div>
            <div className="book-details-button-container">
                <button className="book-details-button" onClick={handleDetailsClick}>
                    Details
                </button>
            </div>
        </div>
    );
}

export default Book;