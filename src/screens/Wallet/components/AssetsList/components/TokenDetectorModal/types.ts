export type TTokenDetectorModalProps = {
  isVisible: boolean;
  toggle: () => void;
};

export type DetectedToken = {
  contract: string;
  balance: number;
  chainId: number;
};
