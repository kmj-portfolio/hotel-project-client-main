const ModalWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex h-full flex-col justify-between md:h-auto">{children}</div>;
};

export default ModalWrapper;
