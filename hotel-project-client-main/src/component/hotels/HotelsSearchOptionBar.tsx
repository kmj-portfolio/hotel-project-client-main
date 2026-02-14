const options = ['이름 순', '리뷰 순', '평점 순'];

const HotelsSearchOptionBar = ({
  setOption,
  option,
}: {
  setOption: (option: string) => void;
  option: string | null;
}) => {
  return (
    <div className="flex w-full justify-center">
      {options.map((val) => (
        <label
          key={val}
          className={`flex w-50 cursor-pointer justify-center px-4 py-2 text-2xl text-black ${option === val ? 'border-primary-500 text-primary-500 border-b-2' : 'text-gray-primary'} transition-colors duration-200`}
        >
          <input
            type="radio"
            name="sortOption"
            value={val}
            checked={option === val}
            onChange={() => setOption(val)}
            className="hidden"
          />
          {val}
        </label>
      ))}
    </div>
  );
};

export default HotelsSearchOptionBar;
