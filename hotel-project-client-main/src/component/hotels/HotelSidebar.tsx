interface HotelSidebarProps {
  isOpen: boolean;
}

const HotelSidebar = ({ isOpen }: HotelSidebarProps) => {
  return (
    <div
      className={`absolute top-0 left-0 h-full w-64 transform border-r bg-white transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-64'
      }`}
    >
      <div className="space-y-2 p-4">
        <div>고급검색</div>
        <div>가격순</div>
        <div>리뷰순</div>
        <div>평점순</div>
        <div>인기순</div>
      </div>
    </div>
  );
};

export default HotelSidebar;
