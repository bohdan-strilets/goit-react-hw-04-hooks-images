import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import fetchImages from '../../services/images-api';
import Searchbar from 'components/Searchbar';
import ImageGallery from 'components/ImageGallery';
import Button from 'components/Button';
import Loader from 'components/Loader';
import Modal from 'components/Modal';

function App() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [imagesOnPage, setImagesOnPage] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [images, setImages] = useState(null);
  const [error, setError] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [currentImageDescription, setCurrentImageDescription] = useState(null);

  if (error) {
    console.log(error);
  }

  useEffect(() => {
    if (query !== '') {
      setIsLoading(prevIsLoading => !prevIsLoading);

      fetchImages(query)
        .then(({ hits, totalHits }) => {
          const imagesArray = hits.map(hit => ({
            id: hit.id,
            description: hit.tags,
            smallImage: hit.webformatURL,
            largeImage: hit.largeImageURL,
          }));

          setPage(1);
          setImages(imagesArray);
          setImagesOnPage(imagesArray.length);
          setTotalImages(totalHits);
        })
        .catch(error => setError(error))
        .finally(() => setIsLoading(prevIsLoading => !prevIsLoading));
    }
  }, [query]);

  useEffect(() => {
    if (page !== 1) {
      setIsLoading(prevIsLoading => !prevIsLoading);
      fetchImages(query, page)
        .then(({ hits }) => {
          const imagesArray = hits.map(hit => ({
            id: hit.id,
            description: hit.tags,
            smallImage: hit.webformatURL,
            largeImage: hit.largeImageURL,
          }));

          setImages(prevImages => [...prevImages, ...imagesArray]);
          setImagesOnPage(
            prevImagesOnPage => prevImagesOnPage + imagesArray.length
          );
        })
        .catch(error => setError(error))
        .finally(() => setIsLoading(prevIsLoading => !prevIsLoading));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const getSearchRequest = query => setQuery(query);

  const onNextFetch = () => setPage(prevPage => prevPage + 1);

  const toggleModal = () => setShowModal(prevShowModal => !prevShowModal);

  const openModal = e => {
    if (e.target.nodeName === 'IMG') {
      setShowModal(prevShowModal => !prevShowModal);
      setCurrentImageUrl(e.target.dataset.large);
      setCurrentImageDescription(e.target.alt);
    }
  };

  return (
    <>
      <Searchbar onSubmit={getSearchRequest} />

      {images && <ImageGallery images={images} openModal={openModal} />}

      {isLoading && <Loader />}

      {imagesOnPage >= 12 && imagesOnPage < totalImages && (
        <Button onNextFetch={onNextFetch} />
      )}

      {showModal && (
        <Modal
          onClose={toggleModal}
          currentImageUrl={currentImageUrl}
          currentImageDescription={currentImageDescription}
        />
      )}

      <ToastContainer />
    </>
  );
}

export default App;
