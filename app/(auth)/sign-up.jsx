import { ScrollView, StyleSheet, Image, View, Text, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {images} from '../../constants';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import {Link, router} from 'expo-router';
import { createUser } from '../../lib/appwrite';
import { useGlobalContext } from '../../context/GlobalProvider';

const SignUp = () => {
  const {setUser,setisLoggedIn} = useGlobalContext();
  const [form, setForm] = useState({
    username:'',
    email: '',
    password: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submit = async () => {
    if(!form.username || !form.email || !form.password){
      Alert.alert('Error', 'Please fill in all the fields')
    }
    setIsSubmitting(true);

    try{
      const result = await createUser( form.email, form.password, form.username)
        setUser(result);
        setisLoggedIn(true);
      router.replace("/home");
    } catch(error) {
      Alert.alert('Error', error.message)
    } finally{
      setIsSubmitting(false);
    }
  };
  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{height:'103%'}}>
        <View className="w-full justify-center 
          min-h-[90vh] px-4 my-6">
            <Image
              source={images.logo}
              resizeMode='contain'
              className="w-[115px] h-[45px]"
            />
            <Text className="text-2xl text-white text-semibold
            mt-10 font-psemibold">Sign up to Aora </Text>
            <FormField
              title="Username"
              value={form.username}
              handleChangeText={(e) => setForm({ ...form,
                username: e})}
              otherStyles="mt-10"
              
            />
            <FormField
              title="Email"
              value={form.email}
              handleChangeText={(e) => setForm({ ...form,
                email: e})}
              otherStyles="mt-7"
              keyboardType="email address"
            />
            <FormField
              title="Password"
              value={form.password}
              handleChangeText={(e) => setForm({ ...form,
                password: e})}
              otherStyles="mt-7"
            />
            <CustomButton
              title="Sign Up"
              handlePress={submit}
              containerStyles="mt-7"
              isLoading={isSubmitting}
            />
            <View className="justify-center pt-5 flex-row gap-2">
              <Text className="text-gray-100 font-pregular">
                Already have an account?
              </Text>
              <Link href="/sign-in" className=" font-psemibold text-secondary ">Sign in</Link>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUp;
