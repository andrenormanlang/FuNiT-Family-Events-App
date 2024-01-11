import  { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { getDoc, getDocs, doc} from 'firebase/firestore';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { forumsCol, postsCol, topicsCol, usersCol } from '../../services/firebase';
import { Button, Box, Typography, Avatar } from '@mui/material';
import {  Forum, Post, Topic } from '../../types/Forum.types';
import useAuth from '../../hooks/useAuth';
import { UserInfo } from '../../types/User.types';
import { useTheme } from '@mui/material/styles';
import { getRelativeTime } from '../../helpers/getRelativeTime';



const TopicList = () => {

const theme = useTheme();
  const { forumId } = useParams<{ forumId?: string }>();
  const [forum, setForum] = useState<Forum | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [usersInfo, setUsersInfo] = useState<Record<string, UserInfo>>({});

  
  const [isLoading, setIsLoading] = useState(true);
  const { signedInUser } = useAuth();

  const dataGridStyle = {
    '& .MuiDataGrid-root': {
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.body2.fontSize,
    },
    '& .MuiDataGrid-columnHeader': {
      backgroundColor: theme.palette.background.default,
    },
    // Add any additional styling here
  };
  

  useEffect(() => {
    const fetchForumAndTopics = async () => {
      if (forumId) {
        // Fetch forum details
        const forumDocRef = doc(forumsCol, forumId);
        const forumSnapshot = await getDoc(forumDocRef);
        if (forumSnapshot.exists()) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          setForum({ id: forumSnapshot.id, ...(forumSnapshot.data() as Forum) });
        } else {
          console.error('Forum not found');
          return;
        }
  
        // Fetch topics
        const topicsSnapshot = await getDocs(topicsCol(forumId));
        const topicsData: Topic[] = [];
        const usersInfoTemp: Record<string, UserInfo> = {};
        const postCountsTemp: Record<string, number> = {};
        const lastPostTimesTemp: Record<string, Date> = {};
        const voiceCountsTemp: Record<string, number> = {};
  
        // Process each topic
        for (const topicDoc of topicsSnapshot.docs) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const topic = { id: topicDoc.id, ...(topicDoc.data() as Topic) };
          topicsData.push(topic);
  
          // Fetch user info if not already present
          if (!usersInfoTemp[topic.authorId]) {
            const userDoc = await getDoc(doc(usersCol, topic.authorId));
            if (userDoc.exists()) {
              usersInfoTemp[topic.authorId] = userDoc.data() as UserInfo;
            } else {
              usersInfoTemp[topic.authorId] = { displayName: 'Unknown', photoURL: '', uid: topic.authorId } as UserInfo; // Replace with actual defaults
            }
          }
  
          // Fetch posts for the topic
          const postsSnapshot = await getDocs(postsCol(forumId, topic.id));
          postCountsTemp[topic.id] = postsSnapshot.size;
  
          // Fetch the last post time and voices
          const authorsSet = new Set<string>();
          postsSnapshot.forEach((postDoc) => {
            const post = postDoc.data() as Post;
            authorsSet.add(post.authorId);
            if (!lastPostTimesTemp[topic.id] || post.createdAt.toDate() > lastPostTimesTemp[topic.id]) {
              lastPostTimesTemp[topic.id] = post.createdAt.toDate();
            }
          });
          voiceCountsTemp[topic.id] = authorsSet.size;
        }
  
        
        const enrichedTopics = topicsData.map((topic) => ({
          ...topic,
          author: usersInfoTemp[topic.authorId],
          createdAt: getRelativeTime(topic.createdAt.toDate()), 
          postCount: postCountsTemp[topic.id],
          voiceCount: voiceCountsTemp[topic.id],
          lastPostTime: lastPostTimesTemp[topic.id] ? getRelativeTime(lastPostTimesTemp[topic.id]) : "No posts",
        }));
        
       
        setUsersInfo(usersInfoTemp); 
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        setTopics(enrichedTopics); 
        setIsLoading(false);
      }
    };
  
    fetchForumAndTopics();
  }, [forumId]);


  

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Topic',
      headerAlign: 'center',
      width: 300,
      renderCell: (params) => (
        <NavLink to={`/forums/${forumId}/topics/${params.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {params.value}
        </NavLink>
      ),
    },
    {
      field: 'authorId',
      headerName: 'Author',
      
      width: 200,
      renderCell: (params) => {
        const authorInfo = usersInfo[params.value as string];
        return authorInfo ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src={authorInfo.photoURL} alt={authorInfo.displayName} sx={{ width: 24, height: 24, marginRight: 1 }} />
            {authorInfo.displayName}
          </Box>
        ) : null;
      },
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      headerAlign: 'center',
      align: 'center',
      width: 200,
      renderCell: (params) => (
        <Typography>{params.value}</Typography> // Use value directly
      ),
    },
    {
      field: 'voiceCount',
      headerName: 'Voices',
      headerAlign: 'center',
      align: 'center', 
      width: 100,
      renderCell: (params) => (
        <Typography>{params.value}</Typography> // Use value directly
      ),
    },
    {
      field: 'postCount',
      headerName: 'Posts',
      headerAlign: 'center',
      align: 'center', // Add this line
      width: 100,
      renderCell: (params) => (
        <Typography>{params.value}</Typography> // Use value directly
      ),
  },
    {
    field: 'lastPostTime',
    headerName: 'Freshness',
    width: 200,
    renderCell: (params) => (
      <Typography>{params.value}</Typography> // Use value directly
    ),
  },
  ];




  if (!forumId || !forum) {
    return <div>Please select a forum to view topics.</div>;
}



return (
    <Box display="flex" flexDirection="column" alignItems="center" marginTop={theme.spacing(1)} marginBottom={theme.spacing(4)}>
      <Box padding={2} sx={{ maxWidth: '1200px' }}>
      <Typography variant="h2" align="center" gutterBottom>{forum.title}</Typography>
     
      <Box mb={2} display="flex" justifyContent="space-between">
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
      <DataGrid
      rows={topics}
      columns={columns}
      loading={isLoading}
      // If you are using the free version of DataGrid, comment out the pageSize line
      // pageSize={5}
      
      sx={dataGridStyle}
      // For the free version, use the onPageSizeChange callback to handle page size changes
    />

      </Box>
        
    </Box>
  );
};

export default TopicList;

