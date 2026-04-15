import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonNote,
} from "@ionic/react";

export interface ActionResultCardProps {
  title: string;
  detail: string;
  note?: string;
}

export default function ActionResultCard({
  title,
  detail,
  note,
}: ActionResultCardProps) {
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>{title}</IonCardTitle>
        <IonCardSubtitle>最近一次操作结果</IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        <pre>{detail}</pre>
        {note ? (
          <p>
            <IonNote color="medium">{note}</IonNote>
          </p>
        ) : null}
      </IonCardContent>
    </IonCard>
  );
}
