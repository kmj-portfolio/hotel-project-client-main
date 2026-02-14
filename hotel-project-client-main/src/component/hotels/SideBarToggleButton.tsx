interface SidebarToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const SidebarToggleButton = ({ isOpen, onClick }: SidebarToggleButtonProps) => {
  return (
    <button
      className={`absolute top-0 left-0 z-50 p-1 transition-all duration-300 border border-l-0 cursor-pointer ${
        isOpen ? 'translate-x-64' : ''
      }`}
      onClick={onClick}
    >
      {isOpen ? '<' : '>'}
    </button>
  );
};

export default SidebarToggleButton;