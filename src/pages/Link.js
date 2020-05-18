import React from "react";
import {
  IonPage,
  IonContent,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import { closeCircleOutline } from "ionicons/icons";

import firebase from "../firebase";

import { Plugins } from "@capacitor/core";
import UserContext from "../contexts/UserContext";
import NavHeader from "../components/Header/NavHeader";
import LinkItem from "../components/Link/LinkItem";
import LinkComment from "../components/Link/LinkComment";
const { Browser } = Plugins;

const Link = (props) => {
  const { user } = React.useContext(UserContext);
  const [link, setLink] = React.useState(null);
  const linkId = props.match.params.linkId;
  const linkRef = firebase.db.collection("links").doc(linkId);

  React.useEffect(() => {
    getLink();
    //eslint-disable-next-line
  }, [linkId]);

  function getLink() {
    linkRef.get().then((doc) => {
      setLink({ ...doc.data(), id: doc.id });
    });
  }

  function handleAddVote() {
    if (!user) {
      props.history.push("/login");
    } else {
      linkRef.get().then((doc) => {
        if (doc.exists) {
          const previousVotes = doc.data().votes;
          const vote = { votedBy: { id: user.uid, name: user.displayName } };
          const updatedVotes = [...previousVotes, vote];
          const voteCount = updatedVotes.length;
          linkRef.update({ votes: updatedVotes, voteCount });
          setLink((prevState) => ({
            ...prevState,
            votes: updatedVotes,
            voteCount: voteCount,
          }));
        }
      });
    }
  }

  function handleDeleteLink() {
    linkRef 
      .delete()
      .then(() => {
        console.log(`Document with ID ${link.id} deleted`);
      })
      .catch((err) => {
        console.error("Error deleting document:", err);
      });
    props.history.push("/");
  }

  function postedByAuthUser(link) {
    return user && user.uid === link.postedBy.id;
  }

  async function openBrowser() {
    await Browser.open({
      url: link.url,
    });
  }

  return (
    <IonPage>
      <NavHeader 
        title={link && link.description}
        option={link && postedByAuthUser(link)}
        icon={closeCircleOutline}
        action={handleDeleteLink}
      />
      <IonContent>
        {link && (
          <>
            <IonGrid>
              <IonRow>
                <IonCol class="ion-text-center">
                  <LinkItem link={link} browser={openBrowser} />
                  <IonButton onClick={() => handleAddVote()} size="small">
                    Upvote
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
            {link.comments.map((comment, index) => (
              <LinkComment
                key={index}
                comment={comment}
                link={link}
                setLink={setLink}
              />
            ))}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Link;