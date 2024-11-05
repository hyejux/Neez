import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ReactDOM from "react-dom/client";
import useKakaoLoader from '../Payment/useKakaoLoader';
import { useSwipeable } from 'react-swipeable';
import './UserMain.css';

function UserMain() {
  const [store, setStore] = useState([]);
  const [distances, setDistances] = useState({});
  const [currentPosition, setCurrentPosition] = useState(null);
  const [visibleCount, setVisibleCount] = useState(2); // 가게 표시 개수 상태
  const LOAD_MORE_COUNT = 1; // 더 볼 가게 수
  const [level1Categories, setLevel1Categories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isBookmarked, setIsBookmarked] = useState([]); //찜
  const [activeSection, setActiveSection] = useState('menu1');


  // 검색어 입력 핸들러
  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // 검색 URL 생성 함수
  const generateSearchUrl = (term) => {
    return `/userSearchResult.user?searchTerm=${encodeURIComponent(term)}`;
  };


  // 검색 버튼 클릭 시 검색어를 쿼리 파라미터로 전달하며 페이지 이동
  const handleSearch = () => {
    if (searchTerm) {
      window.location.href = generateSearchUrl(searchTerm);
    }
  };

  // 추천 해시태그, 카테고리 배너 클릭 시 즉시 검색 실행
  const handleHashtagClick = (serviceName) => {
    window.location.href = generateSearchUrl(serviceName);
  };

  // 각 섹션마다 다른 ref를 사용
  const storeListRef1 = useRef(null);
  const storeListRef2 = useRef(null);
  const storeListRef3 = useRef(null);
  const storeListRef4 = useRef(null);
  const storeListRef5 = useRef(null);
  const storeListRef6 = useRef(null);

  const btnLeftStoreRef1 = useRef(null);
  const btnLeftStoreRef2 = useRef(null);
  const btnLeftStoreRef3 = useRef(null);
  const btnLeftStoreRef4 = useRef(null);
  const btnLeftStoreRef5 = useRef(null);
  const btnLeftStoreRef6 = useRef(null);

  const btnRightStoreRef1 = useRef(null);
  const btnRightStoreRef2 = useRef(null);
  const btnRightStoreRef3 = useRef(null);
  const btnRightStoreRef4 = useRef(null);
  const btnRightStoreRef5 = useRef(null);
  const btnRightStoreRef6 = useRef(null);

  const setupScrollControls = (listWrap, btnLeft, btnRight) => {
    btnLeft.addEventListener('click', () => {
      listWrap.scrollBy({ left: -200, behavior: 'smooth' });
    });

    btnRight.addEventListener('click', () => {
      listWrap.scrollBy({ left: 200, behavior: 'smooth' });
    });

    listWrap.addEventListener('scroll', () => {
      updateButtonVisibility(listWrap, btnLeft, btnRight);
    });

    updateButtonVisibility(listWrap, btnLeft, btnRight);
  };

  const updateButtonVisibility = (list, leftBtn, rightBtn) => {
    const scrollLeft = list.scrollLeft;
    const maxScrollLeft = list.scrollWidth - list.clientWidth;


    leftBtn.style.display = scrollLeft <= 0 ? 'none' : 'block';
    rightBtn.style.display = scrollLeft >= maxScrollLeft ? 'none' : 'block';
  };

  useEffect(() => {
    // 각 섹션마다 스크롤 제어 설정
    setupScrollControls(storeListRef1.current, btnLeftStoreRef1.current, btnRightStoreRef1.current);
    setupScrollControls(storeListRef2.current, btnLeftStoreRef2.current, btnRightStoreRef2.current);
    setupScrollControls(storeListRef3.current, btnLeftStoreRef3.current, btnRightStoreRef3.current);
    setupScrollControls(storeListRef4.current, btnLeftStoreRef4.current, btnRightStoreRef4.current);
  }, [store]);


  // Kakao Maps API 로드
  useKakaoLoader();

  useEffect(() => {
    // 데이터 fetch
    fetch('/getStoreInfo')
      .then((response) => {
        if (!response.ok) {
          throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        return response.json();
      })
      .then((data) => {
        const activeStores = data.filter((store) => store.storeStatus === '활성화');
        setStore(activeStores);
        console.log('활성화된 업체 목록:', activeStores); // 데이터 콘솔 출력
      })
      .catch((error) => console.error('업체 목록을 가져오는 중 오류 발생:', error));
  }, []);

  useEffect(() => {
    fetch('/userSearch/categories/level1')
      .then((response) => {
        if (!response.ok) {
          throw new Error('카테고리를 가져오는 중 오류 발생');
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        const formattedData = data.map(([serviceName, storeNo, servicePrice]) => ({
          serviceName,
          storeNo,
          servicePrice,
        }));
        setLevel1Categories(formattedData);
      })
      .catch((error) => console.error('카테고리를 가져오는 중 오류 발생:', error));
  }, []);


  // 현재 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    } else {
      alert("Geolocation을 지원하지 않습니다.");
    }
  }, []);

  //찜 데이터 가져오기
  useEffect(() => {
    const getBookmarked = async () => {
      try {
        const resp = await axios.get('/userStoreList/getLike');

        if (resp.status === 200) {
          setIsBookmarked(resp.data.map(like => like.storeNo));
          console.log("찜 목록 ", resp.data);
        }
      } catch (error) {
        console.log("찜 데이터 가져오는 중 error ", error);
      }
    };

    getBookmarked();
  }, []);


  // Kakao Map API를 이용한 거리 계산 함수
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // 지구 반지름 (킬로미터 단위)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))); // 거리 반환
  };

  // 거리 계산 및 geocoder 로드
  const getStoreDistance = (storeAddr) => {
    if (currentPosition) {
      if (window.kakao) {
        const geocoder = new kakao.maps.services.Geocoder();

        // storeAddr 파싱 (storeAddr를 직접 사용)
        const addrOnly = storeAddr; // 주소를 직접 사용

        geocoder.addressSearch(addrOnly, (result, status) => {
          if (status === kakao.maps.services.Status.OK) {
            const storeLat = result[0].y;
            const storeLng = result[0].x;
            const distance = calculateDistance(
              currentPosition.lat,
              currentPosition.lng,
              storeLat,
              storeLng
            );
            setDistances((prevDistances) => ({
              ...prevDistances,
              [storeAddr]: distance.toFixed(2),
            }));
          } else {
            console.error(`거리 계산 불가: ${addrOnly} - ${status}`);
          }
        });
      } else {
        console.log("Kakao 객체가 정의되지 않음");
      }
    } else {
      console.log("내 위치 확인 불가");
    }
  };

  useEffect(() => {
    // Kakao Maps API 로드 후 가게 거리 계산
    if (currentPosition && store.length > 0) {
      store.forEach(store => {
        getStoreDistance(store.addr); // addr 필드를 사용하여 거리 계산
      });
    }
  }, [store, currentPosition]);

  // 거리 변환 함수
  const formatDistance = (distance) => {
    const km = parseFloat(distance); // 거리 값을 float로 변환
    if (km >= 1) {
      return `${km.toFixed(2)} km`;  // 1km 이상일 경우 km 단위
    } else {
      return `${(km * 1000).toFixed(0)} m`;  // 1km 미만일 경우 m 단위
    }
  };


  const handleLoadMore = () => {
    if (visibleCount >= store.length) {
      alert("마지막 가게 입니다.");
    } else {
      setVisibleCount((prevCount) => prevCount + LOAD_MORE_COUNT); // 상수로 증가
    }
  };

  const goToStoreDetail = (id) => {
    window.location.href = `/userStoreDetail.user/${id}`;
  }


  // --------------- 광고 슬라이더 ---------------
  // 광고 슬라이더 이미지
  const slides = [
    { id: 1, imageUrl: './img/advertisement/advertisement1.jpg' },
    { id: 2, imageUrl: './img/advertisement/advertisement2.jpg' },
    { id: 3, imageUrl: './img/advertisement/advertisement3.jpg' },
    { id: 4, imageUrl: './img/advertisement/advertisement4.jpg' },
    { id: 5, imageUrl: './img/advertisement/advertisement5.jpg' },
    { id: 6, imageUrl: './img/advertisement/advertisement6.jpg' },
    { id: 7, imageUrl: './img/advertisement/advertisement7.jpg' },
    { id: 8, imageUrl: './img/advertisement/advertisement8.jpg' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // 자동 슬라이딩 기능 (3초마다 슬라이드 이동)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 7000); // 7초 간격으로 슬라이드 변경
    return () => clearInterval(interval);
  }, []);

  // 스와이프 기능을 위한 핸들러
  const handlers = useSwipeable({
    onSwipedLeft: () => goToNextSlide(),
    onSwipedRight: () => goToPreviousSlide(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPreviousSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // ----------------------------------------------------------

  //가게 찜하기
  const handleStoreLike = async (store) => {
    console.log("가게번호 ", store.storeNo);

    try {
      const resp = await axios.post('/userStoreList/storeLike', { storeNo: store.storeNo });
      setIsBookmarked(prev =>
        prev.includes(store.storeNo) ? prev.filter(storeNo => storeNo !== store.storeNo) //찜 해제
          : [...prev, store.storeNo] //찜 추가
      );

    } catch (error) {
      console.log("찜하던 중 error ", error);
    }
  };

  return (
    <div>
      <div className="user-main-container">

        <div className="user-main-header-fix">
          <div className="search-top">
            <div className='left'>뭐 넣지</div>
            <div className='right'><i className="bi bi-heart"></i></div>
          </div>


          {/* 검색바 */}
          <div className="store-search-bar">
            <button className="search-btn" onClick={handleSearch}><i className="bi bi-search"></i></button>
            <input type="text" placeholder="찾으시는 가게가 있나요?" value={searchTerm} onChange={handleInputChange}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearch();
                }
              }} />
          </div>
        </div>


        <div className="user-main-body-fix">

          {/* 광고 슬라이더 */}
          <div className="slider" {...handlers}>
            <div className="slide">
              <img src={slides[currentIndex].imageUrl} alt={`Slide ${currentIndex + 1}`} />
            </div>

            <div className="indicator-container">
              {slides.map((slide, index) => (
                <span
                  key={slide.id}
                  className={`indicator ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                ></span>
              ))}
            </div>
          </div>


          {/* 가게 카테고리 */}
          <div className="user-category-content">
            <div className="store-category-item" onClick={() => handleHashtagClick("디저트")}>
              <img src="./img/category/dessert.png" alt="디저트" />
              <p>디저트</p>
            </div>
            <div className="store-category-item" onClick={() => handleHashtagClick("꽃")}>
              <img src="./img/category/flower.png" alt="꽃" />
              <p>꽃</p>
            </div>
            <div className="store-category-item" onClick={() => handleHashtagClick("공예")}>
              <img src="./img/category/handcraft.png" alt="공예" />
              <p>공예</p>
            </div>
            <div className="store-category-item" onClick={() => handleHashtagClick("뷰티")}>
              <img src="./img/category/beauty.png" alt="뷰티" />
              <p>뷰티</p>
            </div>
            <div className="store-category-item" onClick={() => handleHashtagClick("패션")}>
              <img src="./img/category/fashion.png" alt="패션" />
              <p>패션</p>
            </div>
            <div className="store-category-item" onClick={() => handleHashtagClick("주얼리")}>
              <img src="./img/category/jewelry.png" alt="주얼리" />
              <p>주얼리</p>
            </div>
            <div className="store-category-item" onClick={() => handleHashtagClick("디지털")}>
              <img src="./img/category/digital.png" alt="디지털" />
              <p>디지털</p>
            </div>
            <div className="store-category-item" onClick={() => handleHashtagClick("반려동물")}>
              <img src="./img/category/pet.png" alt="반려동물" />
              <p>반려동물</p>
            </div>
          </div>



          {/* 위치 카테고리 */}
          {/* <h3>어디로 가시나요?</h3>
        <div className="user-location-content">
          <div className="user-location-item">내주변</div>
          <div className="user-location-item">압구정 청담</div>
          <div className="user-location-item">부산</div>
          <div className="user-location-item">잠실 송파</div>
          <div className="user-location-item">이태원 한남</div>
          <div className="user-location-item">성수</div>
        </div> */}




          {/* 배너 */}
          <div className="advertisement-banner">
            <img src='./img/banner/banner1.png' />
          </div>

          {/* 내 주변 가게 */}
          <div className="user-main-content">
            <button className="nav-button left" ref={btnLeftStoreRef1} aria-label="왼쪽으로 이동">‹</button>
            <button className="nav-button right" ref={btnRightStoreRef1} aria-label="오른쪽으로 이동">›</button>
            <h3>내 주변 가게</h3>

            <div className="user-main-list-wrap" ref={storeListRef1}>
              {store.length > 0 ? (
                store.map((store) => {
                  const imageUrl = store.storeImages.length > 0
                    ? store.storeImages[0].storeImgLocation
                    : "/img/cake001.jpg"; // 기본 이미지 설정

                  return (
                    <div className="user-main-list-container" key={store.storeNo} onClick={() => goToStoreDetail(store.storeNo)}>
                      <div className="user-category-menu">
                        <div className="user-category-menu-img">
                          <button className="button bookmark-btn" aria-label="북마크 추가" onClick={(e) => { e.stopPropagation(); handleStoreLike(store); }}>
                            <i className={`bi bi-heart-fill ${isBookmarked.includes(store.storeNo) ? 'like' : ''}`}></i>
                          </button>
                          <img src={imageUrl} alt={store.storeName} />
                        </div>
                        <div className="store-title-1">{store.storeName}</div>
                        <div className="store-category">{store.storeCate || '미등록'}</div>
                        <div className="store-distance">
                          내 위치에서 {distances[store.addr] ? formatDistance(distances[store.addr]) : '정보 없음'}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-stores">정보를 불러오지 못 했습니다 😭</div>
              )}
            </div>
          </div>

          {/* 이벤트/할인 */}
          <div className="user-main-content">
            <button className="nav-button left" ref={btnLeftStoreRef3} aria-label="왼쪽으로 이동">‹</button>
            <button className="nav-button right" ref={btnRightStoreRef3} aria-label="오른쪽으로 이동">›</button>
            <h3>이벤트/할인</h3>

            <div className="user-main-list-wrap" ref={storeListRef3}>
              {store.length > 0 ? (
                store.map((store) => {
                  const imageUrl = store.storeImages.length > 0
                    ? store.storeImages[0].storeImgLocation
                    : "/img/cake001.jpg"; // 기본 이미지 설정

                  return (
                    <div className="user-main-list-container" key={store.storeNo} onClick={() => goToStoreDetail(store.storeNo)}>
                      <div className="user-category-menu">
                        <div className="user-category-menu-img">
                          <button className="button bookmark-btn" aria-label="북마크 추가" onClick={(e) => { e.stopPropagation(); handleStoreLike(store); }}>
                            <i className={`bi bi-heart-fill ${isBookmarked.includes(store.storeNo) ? 'like' : ''}`}></i>
                          </button>
                          <img src={imageUrl} alt={store.storeName} />
                          <div className="event-box">최대 40% 할인 이벤트</div>
                        </div>
                        <div className="store-title-2">{store.storeName}</div>
                        <div className="store-review-option">
                          <span className="store-review"><i className="bi bi-star-fill"></i> {store.averageRating}</span>
                          <span className="store-option">{store.storeCate || '미등록'}</span>
                          {/* • <span className="store-option">{store.storeCate || '미등록'}</span> */}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-stores">정보를 불러오지 못 했습니다 😭</div>
              )}
            </div>
          </div>


          {/* 인기 서비스/트렌드 */}
          <div className="user-main-content">
            <button className="nav-button left" ref={btnLeftStoreRef2} aria-label="왼쪽으로 이동">‹</button>
            <button className="nav-button right" ref={btnRightStoreRef2} aria-label="오른쪽으로 이동">›</button>
            <h3>인기 서비스/트렌드</h3>

            <div className="user-main-list-wrap" ref={storeListRef2}>
              {store.length > 0 ? (
                store.map((store) => {
                  const imageUrl = store.storeImages.length > 0
                    ? store.storeImages[0].storeImgLocation
                    : "/img/cake001.jpg"; // 기본 이미지 설정

                  return (
                    <div className="user-main-list-container" key={store.storeNo} onClick={() => goToStoreDetail(store.storeNo)}>
                      <div className="user-category-menu">
                        <div className="user-category-menu-img">
                          <button className="button bookmark-btn" aria-label="북마크 추가" onClick={(e) => { e.stopPropagation(); handleStoreLike(store); }}>
                            <i className={`bi bi-heart-fill ${isBookmarked.includes(store.storeNo) ? 'like' : ''}`}></i>
                          </button>
                          <img src={imageUrl} alt={store.storeName} />
                        </div>
                        <div className="store-title-2">{store.storeName}</div>
                        <div className="store-review-option">
                          <span className="store-review"><i className="bi bi-star-fill"></i> {store.averageRating}</span>
                          <span className="store-option">{store.storeCate || '미등록'}</span>
                          {/* • <span className="store-option">{store.storeCate || '미등록'}</span> */}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-stores">정보를 불러오지 못 했습니다 😭</div>
              )}
            </div>
          </div>


          {/* 배너 */}
          <div className="advertisement-banner">
            <img src='./img/banner/banner2.png' />
          </div>


          <div class="user-main-menu-bar-container">
            <div class="user-main-menu-bar">
              <button type="button" className={activeSection === 'menu1' ? 'active' : ''} onClick={() => setActiveSection('menu1')}>menu1</button>
              <button type="button" className={activeSection === 'menu2' ? 'active' : ''} onClick={() => setActiveSection('menu2')}>menu2</button>
              <button type="button" className={activeSection === 'menu3' ? 'active' : ''} onClick={() => setActiveSection('menu3')}>menu3</button>
              <button type="button" className={activeSection === 'menu4' ? 'active' : ''} onClick={() => setActiveSection('menu4')}>menu4</button>
            </div>
          </div>

          {activeSection === 'menu1' && (
            <div className="user-main-menu-content">
              {store.length > 0 ? (
                store.slice(0, 3).map((store) => {
                  const imageUrl = store.storeImages.length > 0 ? store.storeImages[0].storeImgLocation : "/img/cake001.jpg";
                  return (
                    <div className="user-main-menu-content-list" key={store.storeNo} onClick={() => goToStoreDetail(store.storeNo)}>
                      <div className="user-main-menu-img" >
                        <img src={imageUrl} alt={store.storeName} />
                      </div>
                      <div className='user-main-menu-info'>
                        <div className="menu-info-store-name">{store.storeName}</div>
                        <div className="menu-info-hashtag">
                          {level1Categories.filter(category => category.storeNo === store.storeNo).slice(0, 3).map((category) => (
                            <span key={category.id} className="menu-info-list-option"><i className="bi bi-hash"></i> {category.serviceName}</span>))}
                        </div>
                        <div className="menu-info-review-cate">
                          <i className="bi bi-star-fill"></i> <span className="menu-info-review">{store.averageRating}</span> <span className="menu-info-cate">{store.storeCate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div>정보를 불러오지 못했습니다</div>
              )}
            </div>
          )}

          {activeSection === 'menu2' && (
            <div className="user-main-menu-content">
              메뉴3
            </div>
          )}

          {activeSection === 'menu3' && (
            <div className="user-main-menu-content">
              {store.length > 0 ? (
                store.slice(0, 3).map((store) => {
                  const imageUrl = store.storeImages.length > 0 ? store.storeImages[0].storeImgLocation : "/img/cake001.jpg";
                  return (
                    <div className="user-main-menu-content-list" key={store.storeNo} onClick={() => goToStoreDetail(store.storeNo)}>
                      <div className="user-main-menu-img" >
                        <img src={imageUrl} alt={store.storeName} />
                      </div>
                      <div className='user-main-menu-info'>
                        <div className="info-store-name">{store.storeName}</div>
                        <div className="info-hashtag">
                          {level1Categories.filter(category => category.storeNo === store.storeNo).slice(0, 3).map((category) => (
                            <span key={category.id} className="result-list-option"><i className="bi bi-hash"></i> {category.serviceName}</span>))}
                        </div>
                        <div className="info-review-cate"><i className="bi bi-star-fill"></i> {store.averageRating} 카테고리: {store.storeCate}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div>정보를 불러오지 못했습니다</div>
              )}
            </div>
          )}

          {activeSection === 'menu4' && (
            <div className="user-main-menu-content">
              메뉴4
            </div>
          )}


          {/* 이벤트/할인 */}
          <div className="user-main-content">
            <button className="nav-button left" ref={btnLeftStoreRef4} aria-label="왼쪽으로 이동">‹</button>
            <button className="nav-button right" ref={btnRightStoreRef4} aria-label="오른쪽으로 이동">›</button>
            <h3>이벤트/할인</h3>

            <div className="user-main-list-wrap" ref={storeListRef4}>
              {store.length > 0 ? (
                store.map((store) => {
                  const imageUrl = store.storeImages.length > 0
                    ? store.storeImages[0].storeImgLocation
                    : "/img/cake001.jpg"; // 기본 이미지 설정

                  return (
                    <div className="user-main-list-container" key={store.storeNo} onClick={() => goToStoreDetail(store.storeNo)}>
                      <div className="user-category-menu">
                        <div className="user-category-menu-img user-category-menu-img2">
                          <button className="button bookmark-btn" aria-label="북마크 추가" onClick={(e) => { e.stopPropagation(); handleStoreLike(store); }}>
                            <i className={`bi bi-heart-fill ${isBookmarked.includes(store.storeNo) ? 'like' : ''}`}></i>
                          </button>
                          <img src={imageUrl} alt={store.storeName} />
                          <div className="event-box">최대 40% 할인 이벤트</div>
                        </div>
                        <div className="store-title-2">{store.storeName}</div>
                        <div className="store-review-option">
                          <span className="store-review"><i className="bi bi-star-fill"></i> {store.averageRating}</span>
                          <span className="store-option">{store.storeCate || '미등록'}</span>
                          {/* • <span className="store-option">{store.storeCate || '미등록'}</span> */}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-stores">정보를 불러오지 못 했습니다 😭</div>
              )}
            </div>
          </div>



          {/* 배너 */}
          <div className="advertisement-banner">
            <img src='./img/banner/banner3.png' />
          </div>

          {/* 이벤트/할인 */}
          <div className="user-main-content">
            <button className="nav-button left" ref={btnLeftStoreRef5} aria-label="왼쪽으로 이동">‹</button>
            <button className="nav-button right" ref={btnRightStoreRef5} aria-label="오른쪽으로 이동">›</button>
            <h3>이벤트/할인</h3>

            <div className="user-main-list-wrap" ref={storeListRef5}>
              {store.length > 0 ? (
                store.map((store) => {
                  const imageUrl = store.storeImages.length > 0
                    ? store.storeImages[0].storeImgLocation
                    : "/img/cake001.jpg"; // 기본 이미지 설정

                  return (
                    <div className="user-main-list-container" key={store.storeNo} onClick={() => goToStoreDetail(store.storeNo)}>
                      <div className="user-category-menu">
                        <div className="user-category-menu-img">
                          <button className="button bookmark-btn" aria-label="북마크 추가" onClick={(e) => { e.stopPropagation(); handleStoreLike(store); }}>
                            <i className={`bi bi-heart-fill ${isBookmarked.includes(store.storeNo) ? 'like' : ''}`}></i>
                          </button>
                          <img src={imageUrl} alt={store.storeName} />
                        </div>
                        <div className="store-title-2">{store.storeName}</div>
                        <div className="store-review-option">
                          <span className="store-review"><i className="bi bi-star-fill"></i> {store.averageRating}</span>
                          <span className="store-option">{store.storeCate || '미등록'}</span>
                          {/* • <span className="store-option">{store.storeCate || '미등록'}</span> */}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-stores">정보를 불러오지 못 했습니다 😭</div>
              )}
            </div>
          </div>


          {/* 이벤트/할인 */}
          <div className="user-main-content">
            <button className="nav-button left">‹</button>
            <button className="nav-button right">›</button>
            <h3>이벤트/할인</h3>

            <div className="user-main-list-wrap user-main-list-wrap-22">
              {store.length > 0 ? (
                store.slice(0, Math.floor(store.length / 2) * 2).map((store) => {
                  const imageUrl = store.storeImages.length > 0
                    ? store.storeImages[0].storeImgLocation
                    : "/img/cake001.jpg"; // 기본 이미지 설정

                  return (
                    <div className="user-main-list-container" key={store.storeNo} onClick={() => goToStoreDetail(store.storeNo)}>
                      <div className="user-category-menu">
                        <div className="user-category-menu-img user-category-menu-img2">
                          <button className="button bookmark-btn" aria-label="북마크 추가" onClick={(e) => { e.stopPropagation(); handleStoreLike(store); }}>
                            <i className={`bi bi-heart-fill ${isBookmarked.includes(store.storeNo) ? 'like' : ''}`}></i>
                          </button>
                          <img src={imageUrl} alt={store.storeName} />
                          <div className="event-box">최대 40% 할인 이벤트</div>
                        </div>
                        <div className="store-title-2">{store.storeName}</div>
                        <div className="store-review-option">
                          <span className="store-review"><i className="bi bi-star-fill"></i> {store.averageRating}</span>
                          <span className="store-option">{store.storeCate || '미등록'}</span>
                          {/* • <span className="store-option">{store.storeCate || '미등록'}</span> */}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-stores">정보를 불러오지 못 했습니다 😭</div>
              )}
            </div>
          </div>

          {/* 배너 */}
          <div className="advertisement-banner">
            <img src='./img/banner/banner2.png' />
          </div>

          {/* 이벤트/할인 */}
          <div className="user-main-content">
            <h3>이벤트/할인</h3>

            <div className="user-main-list-wrap user-main-list-wrap-33">
              {store.length > 0 ? (
                store.slice(0, Math.floor(store.length / 2) * 2).map((store, index) => {
                  const imageUrl = store.storeImages.length > 0
                    ? store.storeImages[0].storeImgLocation
                    : "/img/cake001.jpg"; // 기본 이미지 설정

                  const classNames = ['s', 'l', 'l', 's', 's', 'l', 'l']; // 패턴 정의
                  const className = classNames[index % 7] === 's'
                    ? 'user-main-list-container-s'
                    : 'user-main-list-container-l';

                  return (
                    <div
                      className={`user-main-list-container ${className}`}
                      key={store.storeNo}
                      onClick={() => goToStoreDetail(store.storeNo)}
                    >
                      <div className="user-category-menu">
                        <div className="user-category-menu-img user-category-menu-img2">
                          <img src={imageUrl} alt={store.storeName} />
                          <div className="store-service-name">서비스명</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-stores">정보를 불러오지 못 했습니다 😭</div>
              )}
            </div>
          </div>


          {/* 인기 서비스/트렌드 */}
          <div className="user-main-content">
            <button className="nav-button left" ref={btnLeftStoreRef6} aria-label="왼쪽으로 이동">‹</button>
            <button className="nav-button right" ref={btnRightStoreRef6} aria-label="오른쪽으로 이동">›</button>
            <h3>인기 서비스/트렌드</h3>

            <div className="user-main-list-wrap" ref={storeListRef6}>
              {store.length > 0 ? (
                store.map((store) => {
                  const imageUrl = store.storeImages.length > 0
                    ? store.storeImages[0].storeImgLocation
                    : "/img/cake001.jpg"; // 기본 이미지 설정

                  return (
                    <div className="user-main-list-container" key={store.storeNo} onClick={() => goToStoreDetail(store.storeNo)}>
                      <div className="user-category-menu">
                        <div className="user-category-menu-img">
                          <button className="button bookmark-btn" aria-label="북마크 추가" onClick={(e) => { e.stopPropagation(); handleStoreLike(store); }}>
                            <i className={`bi bi-heart-fill ${isBookmarked.includes(store.storeNo) ? 'like' : ''}`}></i>
                          </button>
                          <img src={imageUrl} alt={store.storeName} />
                        </div>
                        <div className="store-title-2">{store.storeName}</div>
                        <div className="store-review-option">
                          <span className="store-review"><i className="bi bi-star-fill"></i> {store.averageRating}</span>
                          <span className="store-option">{store.storeCate || '미등록'}</span>
                          {/* • <span className="store-option">{store.storeCate || '미등록'}</span> */}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-stores">정보를 불러오지 못 했습니다 😭</div>
              )}
            </div>
          </div>


          {/* 배너 */}
          <div className="advertisement-banner">
            <img src='./img/banner/banner3.png' />
          </div>


          {/*  */}
          <div className="search-result-list-container">
            {store.length > 0 ? (
              store.map((store) => {
                const storeDistance = distances[store.addr] ? formatDistance(distances[store.addr]) : '정보 없음';
                const imageUrl = store.storeImages.length > 0
                  ? store.storeImages[0].storeImgLocation
                  : "/img/cake001.jpg"; // 기본 이미지 설정

                return (
                  <div className="search-result-list-content" key={store.storeId} onClick={() => goToStoreDetail(store.storeNo)}>
                    <button className="button bookmark-btn2" aria-label="북마크 추가" onClick={(e) => { e.stopPropagation(); handleStoreLike(store); }}>
                      <i className={`bi bi-heart-fill ${isBookmarked.includes(store.storeNo) ? 'like' : ''}`}></i>
                    </button>
                    <div className="result-list-content-img-box">
                      <img src={imageUrl} alt={store.storeName} />
                    </div>

                    <div className="result-list-top">
                      <div className="result-list-container">
                        <span className="result-list-title">{store.storeName}</span>
                        <span className="result-list-category">{store.storeCate}</span>
                      </div>
                    </div>

                    <div className="result-list-mid">
                      <div className="result-list-date">
                        <i className="bi bi-clock-fill"></i>영업시간: {store.storeOpenTime ? store.storeOpenTime.slice(0, 5) : ''} - {store.storeCloseTime ? store.storeCloseTime.slice(0, 5) : ''}
                        <span className="result-list-location">
                          <i className="bi bi-geo-alt-fill"></i>현재 위치에서 {storeDistance}
                        </span>
                      </div>
                    </div>

                    <div className="result-list-bottom">
                      <div className="result-list-option-container">
                        {level1Categories.filter(category => category.storeNo === store.storeNo).slice(0, 3).map((category) => (
                          <span key={category.id} className="result-list-option">
                            <i className="bi bi-hash"></i>
                            {category.serviceName}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="result-list-bottom">
                      <div className="result-list-review">
                        <i className="bi bi-star-fill"></i> <span>{store.averageRating}</span>
                        <span>({store.reviewCount})</span>
                      </div>
                      <div className="result-list-price">
                        {level1Categories.filter(category => category.storeNo === store.storeNo).slice(0, 1).map((category, index) => (
                          <div key={index}>
                            ₩ {category.servicePrice || '0,000'} ~
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="no-stores">Loading...</div>
            )}
          </div>

          {/* <div className='load-more-btn-wrap'>
          <button onClick={handleLoadMore} className="load-more-btn">추천 가게 더 보기</button>
        </div> */}



        </div>
      </div>
    </div>


  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<UserMain />);
