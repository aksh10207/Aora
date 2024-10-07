import { View, FlatList, TouchableOpacity, Image, Alert, Text, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import EmptyState from '../../components/EmptyState';
import { getUserPosts, signOut } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import VideoCard from '../../components/VideoCard';
import { useGlobalContext } from '../../context/GlobalProvider';
import { icons } from '../../constants';
import InfoBox from '../../components/InfoBox';
import { router } from 'expo-router';
import CustomModal from 'react-native-modal';  // Import react-native-modal as CustomModal

const Profile = () => {
  const { user, setUser, setisLoggedIn } = useGlobalContext();
  const { data: posts, refetch } = useAppwrite(() => getUserPosts(user.$id)); // Added `refetch` for manual reload

  const [avatar, setAvatar] = useState(user?.avatar);
  const [isModalVisible, setIsModalVisible] = useState(false); // For the image options modal
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false); // For the enlarged avatar modal

  // Function to handle avatar change option
  const pickImage = async (source) => {
    let result;
    if (source === 'gallery') {
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    } else if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    }

    if (!result.canceled) {
      // Update the avatar in state and user context
      const newAvatarUri = result.assets[0].uri;
      setAvatar(newAvatarUri); 
      
      // Update user object with new avatar
      setUser((prevUser) => ({
        ...prevUser,
        avatar: newAvatarUri,
      }));

      // Refetch posts to reflect avatar changes if needed
      refetch();
    }
    setIsModalVisible(false); // Close the modal after selecting
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible); // Toggle modal visibility
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setisLoggedIn(false);
    router.replace('/sign-in');
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard 
            video={item} 
            avatar={avatar} // Pass updated avatar to VideoCard 
          />
        )}
        ListHeaderComponent={() => (
          <View className="w-full justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity className="w-full items-end mb-10" onPress={logout}>
              <Image source={icons.logout} resizeMode="contain" className="w-6 h-6" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsAvatarModalVisible(true)}>
              <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center">
                <Image
                  source={{ uri: avatar }} // Use the updated avatar state
                  className="w-[90%] h-[90%] rounded-lg"
                  resizeMode="cover"
                />
              </View>
            </TouchableOpacity>

            <InfoBox
              title={user?.username}
              containerStyle="mt-5"
              titleStyles="text-lg"
            />
            <View className="mt-5 flex-row">
              <InfoBox
                title={posts.length || 0}
                subtitle="Posts"
                containerStyle="mr-10"
                titleStyles="text-xl"
              />
              <InfoBox title="100k" subtitle="Followers" titleStyles="text-xl" />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState title="No videos Found" subtitle="No videos found for this search result" />
        )}
      />

      {/* Modal for enlarged avatar */}
      <CustomModal
        isVisible={isAvatarModalVisible}
        onBackdropPress={() => setIsAvatarModalVisible(false)}
        className="m-0 justify-center items-center"
      >
        <View className="items-center justify-center">
          <View className="relative">
            <Image
              source={{ uri: avatar }}
              className="w-72 h-72 rounded-full"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => {
                setIsAvatarModalVisible(false);
                toggleModal();
              }}
              className="absolute bottom-2 right-2 bg-primary rounded-full p-2"
            >
              <Image source={icons.upload} className="w-6 h-6" />
            </TouchableOpacity>
          </View>
        </View>
      </CustomModal>

      {/* Modal for selecting image source */}
      <CustomModal isVisible={isModalVisible} onBackdropPress={toggleModal}>
        <View className="bg-primary p-5 rounded-lg">
          <Text className="text-lg font-psemibold text-gray-100 mb-5">Change Profile Picture</Text>
          
          <Pressable className="mb-4" onPress={() => pickImage('gallery')}>
            <Text className="text-gray-100 font-pregular">Choose from Gallery</Text>
          </Pressable>

          <Pressable className="mb-4" onPress={() => pickImage('camera')}>
            <Text className="text-gray-100 font-pregular">Take Photo</Text>
          </Pressable>

          <Pressable onPress={toggleModal}>
            <Text className="text-red-600 mt-5 font-pregular">Cancel</Text>
          </Pressable>
        </View>
      </CustomModal>
    </SafeAreaView>
  );
};

export default Profile;
