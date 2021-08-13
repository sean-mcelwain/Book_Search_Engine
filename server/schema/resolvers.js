const { AuthenticationError } = require("apollo-server-express");
const { User, Book } = require("../models");
const { signToken } = require("../util/auth");

const resolvers = {
    Query: {
      me: async (parent, args, context) => {
        if (context.user) {
          return User.findOne({ _id: context.user._id }).populate("savedBooks");
        }
        throw new AuthenticationError(
          "Please log in to complete this request"
        );
      },
    },
    Mutation: {
      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });

        if (!user) {
          throw new AuthenticationError("Invalid Credentials Entered");
        }
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw new AuthenticationError("Invalid Credentials Entered");
        }
  
        const token = signToken(user);
  
        return { token, user };
      },
  
      addUser: async (parent, { username, email, password }) => {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { token, user };
      },
  
      saveBook: async (parent, { bookInput }, context) => {
        if (context.user) {
          const user = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: bookInput } },
            { new: true }
          );
          return user;
        }
        throw new AuthenticationError(
          "Please log in to complete this request"
        );
      },
  
      removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
          const user = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: bookId } },
            { new: true }
          ).populate("savedBooks");
  
          return user;
        }
        throw new AuthenticationError(
          "Please log in to complete this request"
        );
      },
    },
  };
  
  module.exports = resolvers;