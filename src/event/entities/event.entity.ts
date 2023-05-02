export class Event {
  id?: number;
  uuid?: string;
  name: string;
  description: string;
  initialDate: Date;
  finishDate: Date;
  address: string;
  limitParticipants: number;
  createdAt?: Date;
  updatedAt?: Date;
  coverUrl?: string;
}
