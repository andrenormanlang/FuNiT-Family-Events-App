import React, { useEffect, useState } from 'react';
import { forumsCol, topicsCol, usersCol, postsCol } from '../../services/firebase';
import { getDoc, getDocs, doc, query, orderBy } from 'firebase/firestore';
import { Topic, Forum } from '../../types/Forum.types';
import { NavLink, useParams } from 'react-router-dom';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Typography, Box } from '@mui/material';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '@mui/material/styles';
import { UserInfo } from '../../types/User.types';

const TopicList = () => {
  const theme = useTheme();
  const { forumId } = useParams<{ forumId?: string }>();
  const [forum, setForum] = useState<Forum | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [postCounts, setPostCounts] = useState<Record<string, number>>({});
  const [lastPostTimes, setLastPostTimes] = useState<Record<string, Date>>({});
  const { signedInUser } = useAuth();
  const [usersInfo, setUsersInfo] = useState<Record<string, UserInfo>>({});

  useEffect(() => {
    const fetchForumAndTopics = async () => {
      if (forumId) {
        // Fetch forum details
        const forumDocRef = doc(forumsCol, forumId);
        const forumSnapshot = await getDoc(forumDocRef);
        if (forumSnapshot.exists()) {
         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
          setForum({ id: forumSnapshot.id, ...(forumSnapshot.data() as Forum) });
        } else {
          console.error('Forum not found');
        }

        // Fetch topics and related data
        const topicsQuery = topicsCol(forumId);
        const topicsSnapshot = await getDocs(topicsQuery);
        const topicsData: Topic[] = [];
        const postCountsTemp: Record<string, number> = {};
        const lastPostTimesTemp: Record<string, Date> = {};
        const usersInfoTemp: Record<string, UserInfo> = {};

        for (const topicDoc of topicsSnapshot.docs) {
          const topicData = topicDoc.data() as Topic;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
          topicsData.push({ id: topicDoc.id, ...topicData });

          // Fetch the number of posts for the topic
          const postsQuery = query(postsCol(forumId, topicDoc.id), orderBy('createdAt', 'desc'));
          const postsSnapshot = await getDocs(postsQuery);
          postCountsTemp[topicDoc.id] = postsSnapshot.size;

          // Fetch the last post time
          const lastPostDoc = postsSnapshot.docs[0];
          if (lastPostDoc) {
            lastPostTimesTemp[topicDoc.id] = lastPostDoc.data().createdAt.toDate();
          }

          // Fetch user info if necessary
          if (!usersInfoTemp[topicData.authorId]) {
            const userDocRef = doc(usersCol, topicData.authorId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              usersInfoTemp[topicData.authorId] = userDoc.data() as UserInfo;
            }
          }
        }

        setTopics(topicsData);
        setPostCounts(postCountsTemp);
        setLastPostTimes(lastPostTimesTemp);
        setUsersInfo(usersInfoTemp);
      }
    };

    fetchForumAndTopics();
  }, [forumId]);

  

  if (!forumId || !forum) {
    return <div>Please select a forum to view topics.</div>;
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" marginTop={1} marginBottom={theme.spacing(4)}>
      <Box padding={2} sx={{ maxWidth: '1200px' }}>
        <Typography variant="h2" align="center" gutterBottom>{forum.title}</Typography>
        <Typography variant="subtitle1" align="center" gutterBottom>{forum.description}</Typography>

        {/* Add Table UI here */}
        <TableContainer component={Paper}>
        <Table aria-label="topics table">
          <TableHead>
            <TableRow>
              <TableCell>Topic</TableCell>
              <TableCell>Created by</TableCell> {/* New column for user */}
              <TableCell align="right">Voices</TableCell>
              <TableCell align="right">Posts</TableCell>
              <TableCell align="right">Freshness</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topics.map((topic) => {
              const authorInfo = usersInfo[topic.authorId];
              const postCount = postCounts[topic.id];
              const lastPostTime = lastPostTimes[topic.id];

              return (
                <TableRow key={topic.id}>
                  <TableCell component="th" scope="row">
                    <NavLink to={`/forums/${forumId}/topics/${topic.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {topic.title}
                    </NavLink>
                  </TableCell>
                  <TableCell>
                    {authorInfo && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={authorInfo.photoURL} alt={authorInfo.displayName} sx={{ width: 24, height: 24, marginRight: 1 }} />
                        <Typography variant="body2">{authorInfo.displayName}</Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell align="right">{/* Voices logic here */}</TableCell>
                  <TableCell align="right">{postCount}</TableCell>
                  <TableCell align="right">{lastPostTime ? `${lastPostTime.toLocaleDateString()} ${lastPostTime.toLocaleTimeString()}` : 'N/A'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

        {/* Back and Create New Topic Buttons */}
        <Box mt={2}>
          <NavLink to="/forums" style={{ textDecoration: 'none' }}>
            <Button variant="contained" color="primary" style={{ marginRight: '10px' }}>
              Back to All Forums
            </Button>
          </NavLink>
          {signedInUser && (
            <NavLink to={`/forums/${forumId}/create-topic`} style={{ textDecoration: 'none' }}>
              <Button variant="contained" color="secondary">
                Create New Topic
              </Button>
            </NavLink>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TopicList;
