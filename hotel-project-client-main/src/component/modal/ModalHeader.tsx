import { ArrowLeft } from 'lucide-react';

interface ModalHeaderProps {
  onClick: () => void;
  headerTitle: string;
}

const ModalHeader = ({ onClick, headerTitle }: ModalHeaderProps) => {
  return (
    <div aria-label="modal-header">
      <ArrowLeft
        aria-label="닫기"
        role="button"
        onClick={onClick}
        className="absolute top-5 left-5 cursor-pointer md:top-5"
        strokeWidth={1}
      />
      <h4 className="text-center">{headerTitle}</h4>
    </div>
  );
};

export default ModalHeader;
